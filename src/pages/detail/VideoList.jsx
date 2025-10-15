import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import tmdbApi from "../../api/tmdbApi";
import vidsrcApi from "../../api/vidsrcApi";
import adBlocker from "../../utils/adBlocker";

const DEFAULT_RUNTIME_MIN = 20; // fallback runtime in minutes

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
  const [posterUrl, setPosterUrl] = useState(null);

  // Fetch video sources and runtime info
  const getVideos = useCallback(async () => {
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
        } catch (err) {
          console.error("Error fetching TV details:", err);
          setRuntime(DEFAULT_RUNTIME_MIN * 60);
          setPosterUrl(null);
        }
      }
    } catch (error) {
      console.error("Error fetching videos or runtime:", error);
    }
  }, [props.id, props.category, props.season, props.episode, category, selectedSeason, selectedEpisode]);

  useEffect(() => {
    setIsPlaying(true);
    getVideos();
    return () => {
      setRuntime(null);
    };
  }, [props.category, category, props.id, selectedSeason, selectedEpisode, getVideos]);

  const getSeasons = useCallback(async () => {
    if (props.category === "tv" || category === "tv") {
      try {
        const data = await tmdbApi.getSeasons(props.id);
        setSeasons(data.seasons || []);
        if (data.seasons?.length) setSelectedSeason(data.seasons[0].season_number);
      } catch (error) {
        console.error("Error fetching seasons:", error);
      }
    }
  }, [props.id, props.category, category]);

  useEffect(() => {
    getSeasons();
  }, [props.category, category, props.id, getSeasons]);

  const getEpisodes = useCallback(async () => {
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
  }, [props.id, props.category, category, selectedSeason]);

  useEffect(() => {
    getEpisodes();
  }, [props.category, category, props.id, selectedSeason, getEpisodes]);

  const handleNextEpisode = () => {
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
          posterUrl={posterUrl}
        />
      )}
    </div>
  );
};

export default VideoList;

/* -------------------- VideoPlayer -------------------- */
const VideoPlayer = ({ url, onNext, onPrev, runtime, posterUrl }) => {
  const playerRef = useRef(null);
  const iframeContainerRef = useRef(null);

  const [showControls, setShowControls] = useState(true);
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

// ...existing code...
