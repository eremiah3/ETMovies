import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import tmdbApi from "../../api/tmdbApi";
import vidsrcApi from "../../api/vidsrcApi";
import adBlocker from "../../utils/adBlocker";

const DEFAULT_RUNTIME_MIN = 20; // fallback runtime in minutes
const OVERLAY_SHOW_BEFORE = 10; // seconds before end to show overlay
const OVERLAY_COUNTDOWN = 5; // seconds countdown in overlay

const VideoList = (props) => {
  const { category } = useParams();

  const [videos, setVideos] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [runtime, setRuntime] = useState(null); // seconds
  const [nextPreview, setNextPreview] = useState(null); // {title, still_path}
  const [posterUrl, setPosterUrl] = useState(null);

  // Fetch video sources and runtime info
  const getVideos = async () => {
    try {
      if (props.category === "movie" || category === "movie") {
        const sources = await vidsrcApi.getMovieStream(props.id);
        if (!sources || sources.length === 0) throw new Error("No movie sources");
        setVideos([
          {
            id: props.id,
            name: "Full Movie",
            key: props.id,
            vidSrcUrl: sources[0]?.url,
            source: sources[0]?.source,
            allSources: sources,
          },
        ]);
        setCurrentSourceIndex(0);

        try {
          const movieData = await tmdbApi.detail(props.category, props.id);
          const runtimeMin = movieData?.runtime ?? DEFAULT_RUNTIME_MIN;
          setRuntime((runtimeMin || DEFAULT_RUNTIME_MIN) * 60);
          setPosterUrl(movieData?.poster_path ? `https://image.tmdb.org/t/p/w780${movieData.poster_path}` : null);
        } catch (err) {
          setRuntime(DEFAULT_RUNTIME_MIN * 60);
          setPosterUrl(null);
        }
      } else if (props.category === "tv" || category === "tv") {
        const season = selectedSeason || props.season || 1;
        const episode = selectedEpisode || props.episode || 1;
        let sources = await vidsrcApi.getTvStream(props.id, season, episode);
        sources = (sources || []).filter((s) => s.source?.includes("vidsrc"));
        if (sources.length === 0) {
          sources = await vidsrcApi.getTvStream(props.id, season, episode);
        }
        if (!sources || sources.length === 0) throw new Error("No TV sources");
        setVideos([
          {
            id: props.id,
            name: "Full Episode",
            key: `${props.id}-${season}-${episode}`,
            vidSrcUrl: sources[0]?.url,
            source: sources[0]?.source,
            allSources: [sources[0]],
          },
        ]);
        setCurrentSourceIndex(0);

        try {
          const epData = await tmdbApi.getEpisodeDetails(props.id, season, episode);
          const runtimeMin = (epData?.runtime ?? epData?.runtimeMinutes) ?? DEFAULT_RUNTIME_MIN;
          setRuntime((runtimeMin || DEFAULT_RUNTIME_MIN) * 60);

          const showData = await tmdbApi.detail(props.category, props.id);
          setPosterUrl(showData?.poster_path ? `https://image.tmdb.org/t/p/w780${showData.poster_path}` : null);

          const epIndex = episode;
          const episodesList = await tmdbApi.getEpisodes(props.id, season);
          const nextEpisodeObj = episodesList?.episodes?.find(e => e.episode_number === epIndex + 1);
          if (nextEpisodeObj) {
            setNextPreview({
              title: nextEpisodeObj.name || `Episode ${nextEpisodeObj.episode_number}`,
              still_path: nextEpisodeObj.still_path || null,
            });
          } else {
            const currentSeasonIndex = seasons.findIndex(s => s.season_number === season);
            if (currentSeasonIndex + 1 < seasons.length) {
              const nextSeason = seasons[currentSeasonIndex + 1];
              setNextPreview({
                title: nextSeason.name || `Season ${nextSeason.season_number}`,
                still_path: nextSeason.poster_path || null,
              });
            } else {
              setNextPreview({
                title: showData?.name || "End of Series",
                still_path: null,
              });
            }
          }
        } catch (err) {
          console.error("Error fetching TV details:", err);
          setRuntime(DEFAULT_RUNTIME_MIN * 60);
          setNextPreview(null);
          setPosterUrl(null);
        }
      }
    } catch (error) {
      console.error("Error fetching videos or runtime:", error);
    }
  };

  useEffect(() => {
    setIsPlaying(true);
    getVideos();
    return () => {
      setRuntime(null);
      setNextPreview(null);
    };
  }, [props.category, category, props.id, selectedSeason, selectedEpisode]);

  useEffect(() => {
    const getSeasons = async () => {
      if (props.category === "tv" || category === "tv") {
        try {
          const data = await tmdbApi.getSeasons(props.id);
          setSeasons(data.seasons || []);
          if (data.seasons?.length) setSelectedSeason(data.seasons[0].season_number);
        } catch (error) {
          console.error("Error fetching seasons:", error);
        }
      }
    };
    getSeasons();
  }, [props.category, category, props.id]);

  useEffect(() => {
    const getEpisodes = async () => {
      if ((props.category === "tv" || category === "tv") && selectedSeason !== null) {
        try {
          const data = await tmdbApi.getEpisodes(props.id, selectedSeason);
          setEpisodes(data.episodes || []);
          if (data.episodes?.length) {
            setSelectedEpisode(data.episodes[0].episode_number);
            setIsPlaying(true);
          }
        } catch (error) {
          console.error("Error fetching episodes:", error);
        }
      }
    };
    getEpisodes();
  }, [props.category, category, props.id, selectedSeason]);

  const handleNextEpisode = () => {
    setNextPreview(null);
    if (props.category === "tv" || category === "tv") {
      if (selectedEpisode < episodes.length) {
        setSelectedEpisode((s) => s + 1);
      } else {
        const nextSeasonIndex = seasons.findIndex((s) => s.season_number === selectedSeason) + 1;
        if (nextSeasonIndex < seasons.length) {
          setSelectedSeason(seasons[nextSeasonIndex].season_number);
          setSelectedEpisode(1); // Start at first episode of next season
        } else {
          console.log("End of series reached");
          setIsPlaying(false); // Stop playback at series end
        }
      }
    }
    setIsPlaying(true);
  };

  const handlePrevEpisode = () => {
    setNextPreview(null);
    if (props.category === "tv" || category === "tv") {
      if (selectedEpisode > 1) {
        setSelectedEpisode((s) => s - 1);
      } else {
        const prevIndex = seasons.findIndex((s) => s.season_number === selectedSeason) - 1;
        if (prevIndex >= 0) {
          setSelectedSeason(seasons[prevIndex].season_number);
          setTimeout(() => {
            if (episodes.length > 0) setSelectedEpisode(episodes.length);
          }, 500);
        }
      }
    }
    setIsPlaying(true);
  };

  return (
    <div className="video-list-container">
      {(props.category === "tv" || category === "tv") && seasons.length > 0 && (
        <div className="video-controls">
          <div className="season-episode-selectors">
            <div className="selector-group">
              <label>Season:</label>
              <select
                value={selectedSeason || ""}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
              >
                {seasons.map((s) => (
                  <option key={s.id} value={s.season_number}>
                    {s.name || `Season ${s.season_number}`}
                  </option>
                ))}
              </select>
            </div>

            {episodes.length > 0 && (
              <div className="selector-group">
                <label>Episode:</label>
                <select
                  value={selectedEpisode || ""}
                  onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                >
                  {episodes.map((ep) => (
                    <option key={ep.id} value={ep.episode_number}>
                      {`Episode ${ep.episode_number} - ${ep.name || ""}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {videos.length > 0 && isPlaying && videos[currentSourceIndex] && (
        <VideoPlayer
          url={videos[currentSourceIndex].vidSrcUrl}
          onNext={(props.category === "tv" || category === "tv") ? handleNextEpisode : null}
          onPrev={(props.category === "tv" || category === "tv") ? handlePrevEpisode : null}
          runtime={runtime}
          nextPreview={nextPreview}
          posterUrl={posterUrl}
        />
      )}
    </div>
  );
};

export default VideoList;

/* -------------------- VideoPlayer -------------------- */
const VideoPlayer = ({ url, onNext, onPrev, runtime, nextPreview, posterUrl }) => {
  const playerRef = useRef(null);
  const iframeContainerRef = useRef(null);
  const messageListenerRef = useRef(null);
  const overlayTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const [showControls, setShowControls] = useState(true);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [countdown, setCountdown] = useState(OVERLAY_COUNTDOWN);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // fullscreen helper
  const handleFullscreen = () => {
    const el = playerRef.current;
    if (el?.requestFullscreen) el.requestFullscreen();
    else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el?.msRequestFullscreen) el.msRequestFullscreen();
  };

  // auto-hide controls on inactivity
  useEffect(() => {
    let hideTimeout;
    const showAndHide = () => {
      setShowControls(true);
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => setShowControls(false), 2500);
    };

    const player = playerRef.current;
    player?.addEventListener("mousemove", showAndHide);
    player?.addEventListener("touchstart", showAndHide);

    hideTimeout = setTimeout(() => setShowControls(false), 2500);

    return () => {
      player?.removeEventListener("mousemove", showAndHide);
      player?.removeEventListener("touchstart", showAndHide);
      clearTimeout(hideTimeout);
    };
  }, []);

  // helper to clear overlay timers
  const clearOverlayTimers = () => {
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowNextOverlay(false);
    setCountdown(OVERLAY_COUNTDOWN);
  };

  // Handle postMessage for video end events
  useEffect(() => {
    const handleMessage = (event) => {
      console.log("Received postMessage:", event.data);
      try {
        if (typeof event.data === "string") {
          const msg = event.data.toLowerCase();
          if (msg.includes("end") || msg.includes("finish") || msg.includes("complete") || msg.includes("done")) {
            console.log("Detected video end via postMessage:", msg);
            clearOverlayTimers();
            triggerOverlayAndAutoNext();
          }
        } else if (typeof event.data === "object" && (
          event.data?.event === "ended" ||
          event.data?.type === "ended" ||
          event.data?.status === "finished" ||
          event.data?.playback === "ended"
        )) {
          console.log("Detected video end via object postMessage:", event.data);
          clearOverlayTimers();
          triggerOverlayAndAutoNext();
        }
      } catch (e) {
        console.error("Error parsing postMessage:", e);
      }
    };

    window.addEventListener("message", handleMessage);
    messageListenerRef.current = handleMessage;
    return () => {
      window.removeEventListener("message", handleMessage);
      messageListenerRef.current = null;
    };
  }, []);

  // Use TMDB runtime to schedule overlay
  useEffect(() => {
    clearOverlayTimers();

    const effectiveRuntime = (runtime && Number(runtime) > 5) ? Number(runtime) : DEFAULT_RUNTIME_MIN * 60;
    const triggerAtMs = Math.max(0, (effectiveRuntime - OVERLAY_SHOW_BEFORE) * 1000);
    const safeTrigger = triggerAtMs > 0 ? triggerAtMs : 5000;

    console.log(`Scheduling overlay at ${safeTrigger/1000}s (runtime: ${effectiveRuntime}s)`);

    overlayTimerRef.current = setTimeout(() => {
      console.log("Overlay triggered by runtime timer");
      triggerOverlayAndAutoNext();
    }, safeTrigger);

    return () => {
      clearOverlayTimers();
    };
  }, [url, runtime]);

  // UPDATED: Auto-play next season/episode after countdown
  const triggerOverlayAndAutoNext = () => {
    console.log("Triggering overlay with nextPreview:", nextPreview, "posterUrl:", posterUrl);
    setShowNextOverlay(true);
    setCountdown(OVERLAY_COUNTDOWN);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    let counter = OVERLAY_COUNTDOWN;
    countdownIntervalRef.current = setInterval(() => {
      counter -= 1;
      setCountdown(counter);
      if (counter <= 0) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setShowNextOverlay(false);
        setCountdown(OVERLAY_COUNTDOWN);
        if (onNext) {
          console.log("Auto-playing next content");
          onNext();
        } else {
          console.log("No next content to play");
        }
      }
    }, 1000);
  };

  const handlePlayNow = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }
    setShowNextOverlay(false);
    setCountdown(OVERLAY_COUNTDOWN);
    if (onNext) {
      console.log("Manually playing next content");
      onNext();
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearOverlayTimers();
      if (messageListenerRef.current) {
        window.removeEventListener("message", messageListenerRef.current);
        messageListenerRef.current = null;
      }
    };
  }, []);

  // Manually create and append iframe with onload
  useEffect(() => {
    const container = iframeContainerRef.current;
    if (container && url) {
      container.innerHTML = '';
      setVideoLoaded(false);

      const iframe = adBlocker.createAdBlockedIframe(url, {
        width: "100%",
        height: "100vh",
        allow: "autoplay; fullscreen",
        autoplay: true,
      });

      iframe.onload = () => {
        setVideoLoaded(true);
      };

      container.appendChild(iframe);

      return () => {
        iframe.onload = null;
        if (container) container.innerHTML = '';
      };
    }
  }, [url]);

  // helper to build TMDB image url
  const buildImageUrl = (path) => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/w780${path}`;
  };

  // Preview URL with fallback to posterUrl
  const previewImageUrl = nextPreview?.still_path ? buildImageUrl(nextPreview.still_path) : (posterUrl || null);
  console.log("Preview image URL:", previewImageUrl);

  return (
    <div
      ref={playerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#000",
        backgroundImage: (!videoLoaded && posterUrl) ? `url(${posterUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        ref={iframeContainerRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Floating controls placed inside video container (auto-hide) */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "40px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s ease",
          zIndex: 9999,
          pointerEvents: showControls ? "auto" : "none",
        }}
      >
        {onPrev && (
          <button onClick={onPrev} style={controlBtnStyle}>
            <i className="fas fa-backward"></i>
          </button>
        )}
        {onNext && (
          <button onClick={onNext} style={controlBtnStyle}>
            <i className="fas fa-forward"></i>
          </button>
        )}
        <button onClick={handleFullscreen} style={controlBtnStyle}>
          <i className="fas fa-expand"></i>
        </button>
      </div>

      {/* Show overlay whenever triggered */}
      {showNextOverlay && (
        <div style={overlayStyle}>
          <div style={{ display: "flex", gap: 24, alignItems: "center", maxWidth: 980, padding: 12 }}>
            {/* preview image with fallback */}
            {previewImageUrl ? (
              <img
                src={previewImageUrl}
                alt={nextPreview?.title || "Next Preview"}
                style={{ width: 260, height: 146, objectFit: "cover", borderRadius: 6, boxShadow: "0 8px 30px rgba(0,0,0,0.6)" }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{ width: 260, height: 146, background: "#222", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#999" }}>No preview</span>
              </div>
            )}

            <div style={{ color: "#fff", textAlign: "left" }}>
              <h3 style={{ margin: 0, fontSize: 20 }}>{nextPreview?.title || "Next Episode"}</h3>
              <p style={{ marginTop: 8, color: "#ddd" }}>
                {nextPreview?.title.includes("Season") ? "Next season" : nextPreview?.title.includes("End of Series") ? "Series ended" : "Next episode"} starts in <strong style={{ color: "#ffd14d" }}>{countdown}s</strong>
              </p>

              <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                <button onClick={handlePlayNow} style={{
                  background: "#e50914", border: "none", color: "#fff", padding: "10px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600
                }}>
                  ▶ Play Now
                </button>

                <button onClick={() => { setShowNextOverlay(false); setCountdown(OVERLAY_COUNTDOWN); }} style={{
                  background: "transparent", border: "1px solid rgba(255,255,255,0.14)", color: "#fff", padding: "10px 12px", borderRadius: 6, cursor: "pointer"
                }}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* styles */
const controlBtnStyle = {
  background: "rgba(0,0,0,0.6)",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "42px",
  height: "42px",
  cursor: "pointer",
  fontSize: "18px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const overlayStyle = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85))",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10000,
  padding: 20,
  boxSizing: "border-box",
};

// export default VideoList;