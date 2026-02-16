import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import tmdbApi from "../../api/tmdbApi";
import vidsrcApi from "../../api/vidsrcApi";
import adBlocker from "../../utils/adBlocker";
import { addContinueWatching, addContinueWatchingToLocal } from "../../utils/continueWatching";

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
  const [hasTracked, setHasTracked] = useState(false); // Track if we've already logged this viewing

  // Fetch video sources and runtime info
  const getVideos = useCallback(async () => {
    try {
      if (props.category === "movie" || category === "movie") {
        let sources = await vidsrcApi.getMovieStream(props.id);

        // If VidSrc returned candidates, ask the preflight server which (if any) is reachable.
        if (sources && sources.length) {
          try {
            const resp = await fetch('http://localhost:4000/preflight', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ urls: sources.map(s => s.url) }),
            });
            if (resp.ok) {
              const j = await resp.json();
              if (!j || !j.okUrl) {
                // No VidSrc candidate reachable -> try YouTube fallback
                const title = (props.item?.title || props.item?.name || '').trim();
                const q = `${title} full movie${props.category === 'nollywood' ? ' Nollywood' : ''}`.trim();
                const yt = await vidsrcApi.getYouTubeFallback(q);
                if (yt && yt.length) sources = yt;
              } else {
                // Move the okUrl to the front of sources for reliability
                sources = sources.sort((a,b)=> (a.url===j.okUrl? -1: b.url===j.okUrl? 1:0));
              }
            }
          } catch (err) {
            // ignore preflight errors and continue with original sources
            console.warn('Preflight check failed:', err);
          }
        }

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
        // If still no sources, try YouTube fallback (search for show + SxExx or "full episode")
        if (!sources || sources.length === 0) {
          const showTitle = (props.item?.name || props.item?.title || '').trim();
          const epLabel = `S${String(season).padStart(2,'0')}E${String(episode).padStart(2,'0')}`;
          const q = `${showTitle} ${epLabel} full episode${props.category === 'nollywood' ? ' Nollywood' : ''}`.trim();
          const yt = await vidsrcApi.getYouTubeFallback(q);
          if (yt && yt.length) sources = yt;
        }
        if (!sources || sources.length === 0) throw new Error("No TV sources");
        setVideos([
          {
            id: props.id,
            name: "Full Episode",
            key: `${props.id}-${season}-${episode}`,
            vidSrcUrl: sources[0]?.url,
            source: sources[0]?.source,
            allSources: sources,
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
  }, [props.id, props.category, props.season, props.episode, category, selectedSeason, selectedEpisode, props.item]);

  useEffect(() => {
    setIsPlaying(true);
    setHasTracked(false); // Reset tracking for new video
    getVideos();
    return () => {
      setRuntime(null);
    };
  }, [props.category, category, props.id, selectedSeason, selectedEpisode, getVideos]);

  // Track movie/show as watched as soon as it starts playing
  useEffect(() => {
    if (isPlaying && !hasTracked && props.item && videos.length > 0) {
      const item = {
        id: props.id,
        title: props.item.title || props.item.name,
        poster_path: props.item.poster_path,
        backdrop_path: props.item.backdrop_path,
        overview: props.item.overview,
      };
      
      // Save to localStorage instantly for immediate display
      addContinueWatchingToLocal(item, props.category);
      
      // Also save to Firestore for cross-device sync
      addContinueWatching(item, props.category);
      
      setHasTracked(true);
    }
  }, [isPlaying, hasTracked, props.item, videos.length, props.id, props.category]);

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
          sources={videos[currentSourceIndex].allSources || []}
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
const VideoPlayer = ({ url, sources = [], onNext, onPrev, runtime, posterUrl }) => {
  const playerRef = useRef(null);
  const iframeContainerRef = useRef(null);

  const [showControls, setShowControls] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentSourceIdx, setCurrentSourceIdx] = useState(0);
  const [loadError, setLoadError] = useState(null);

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

  // Try to load iframe from current source (either explicit url or sources[currentSourceIdx])
  useEffect(() => {
    const container = iframeContainerRef.current;
    if (!container) return;

    let cleanupFns = [];

    const tryFallback = () => {
      const next = currentSourceIdx + 1;
      if (sources && next < sources.length) {
        setCurrentSourceIdx(next);
      } else {
        setLoadError('Could not load video from available sources (network error).');
      }
    };

    const src = url || (sources[currentSourceIdx] && sources[currentSourceIdx].url);
    if (!src) {
      setLoadError('No video source available');
      return;
    }

    // clear container and reset states
    container.innerHTML = '';
    setVideoLoaded(false);
    setLoadError(null);

    // Try a server-side preflight if available to pick a healthy source
    const tryUsePreflight = async (candidateUrls) => {
      try {
        const resp = await fetch('http://localhost:4000/preflight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: candidateUrls }),
        });
        if (!resp.ok) return null;
        const j = await resp.json();
        return j.okUrl || null;
      } catch (err) {
        return null;
      }
    };

    (async () => {
      const candidates = sources && sources.length ? sources.map(s => s.url) : [src];
      const ok = await tryUsePreflight(candidates);
      const finalSrc = ok || src;

      const wrapper = adBlocker.createAdBlockedIframe(finalSrc, { width: '100%', height: '100vh', allow: 'autoplay; fullscreen' });
      container.appendChild(wrapper);

      // Find inner iframe to attach events
      const innerIframe = wrapper.querySelector && wrapper.querySelector('iframe');

      let loadTimeout = setTimeout(() => {
        console.warn('Iframe load timeout for', finalSrc);
        tryFallback();
      }, 10000);

      if (innerIframe) {
        const onLoad = () => {
          clearTimeout(loadTimeout);
          setVideoLoaded(true);
          setLoadError(null);
        };
        innerIframe.addEventListener('load', onLoad);
        cleanupFns.push(() => innerIframe.removeEventListener('load', onLoad));
      }

      // listen for postMessage errors (some players send 'fragLoadError' or similar)
      const onMessage = (e) => {
        try {
          const d = e.data;
          if (typeof d === 'string') {
            const low = d.toLowerCase();
            if (low.includes('fragloaderror') || low.includes('networkerror') || low.includes('error')) {
              console.warn('Received player error message from iframe:', d);
              tryFallback();
            }
          }
        } catch (err) {
          // ignore
        }
      };
      window.addEventListener('message', onMessage);
      cleanupFns.push(() => window.removeEventListener('message', onMessage));

    })();
    return () => {
      cleanupFns.forEach((fn) => fn());
      if (container) container.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, sources, currentSourceIdx]);

  const ErrorBanner = () => (
    loadError ? (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#c62828', color: '#fff', padding: '8px 12px', zIndex: 10001 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>{loadError}</div>
          <div>
            <button onClick={() => { setCurrentSourceIdx(0); setLoadError(null); }} style={{ background: '#fff', color: '#000', border: 'none', padding: '6px 10px', borderRadius: 4 }}>Retry</button>
          </div>
        </div>
      </div>
    ) : null
  );

  return (
    <div
      ref={playerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: '#000',
        backgroundImage: (!videoLoaded && posterUrl) ? `url(${posterUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <ErrorBanner />

      {/* YouTube fallback plays embedded in-site (no external badge) */}
      <div
        ref={iframeContainerRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Floating controls placed inside video container (auto-hide) */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 9999,
          pointerEvents: showControls ? 'auto' : 'none',
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
