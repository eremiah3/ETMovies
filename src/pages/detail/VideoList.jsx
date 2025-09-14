import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import tmdbApi from "../../api/tmdbApi";
import vidsrcApi from "../../api/vidsrcApi";
import adBlocker from "../../utils/adBlocker";

const VideoList = (props) => {
  const { category } = useParams();

  const [videos, setVideos] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

  // Move getVideos outside useEffect to make it accessible
  const getVideos = async () => {
    try {
      if (props.category === "movie" || category === "movie") {
        const sources = await vidsrcApi.getMovieStream(props.id);
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
      } else if (props.category === "tv" || category === "tv") {
        const season = selectedSeason || props.season || 1;
        const episode = selectedEpisode || props.episode || 1;
        let sources = await vidsrcApi.getTvStream(props.id, season, episode);
        sources = sources.filter((source) => source.source === "vidsrc.in");
        if (sources.length === 0) {
          sources = await vidsrcApi.getTvStream(props.id, season, episode);
        }
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
      } else {
        const sources = await vidsrcApi.getMovieStream(props.id);
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
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    if (props.category === "tv" || category === "tv") {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
    getVideos(); // Call getVideos on mount or category change
  }, [props.category, category, props.id, selectedSeason, selectedEpisode, props.season, props.episode]);

  useEffect(() => {
    const getSeasons = async () => {
      if (props.category === "tv" || category === "tv") {
        try {
          const seasonsResponse = await tmdbApi.getSeasons(props.id);
          setSeasons(seasonsResponse.seasons || []);
          if (seasonsResponse.seasons && seasonsResponse.seasons.length > 0) {
            setSelectedSeason(seasonsResponse.seasons[0].season_number);
          }
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
          const episodesResponse = await tmdbApi.getEpisodes(props.id, selectedSeason);
          setEpisodes(episodesResponse.episodes || []);
          if (episodesResponse.episodes && episodesResponse.episodes.length > 0) {
            setSelectedEpisode(episodesResponse.episodes[0].episode_number);
          }
        } catch (error) {
          console.error("Error fetching episodes:", error);
        }
      }
    };
    getEpisodes();
  }, [props.category, category, props.id, selectedSeason]);

  const handlePlay = (e) => {
    e.preventDefault(); // Prevent any default form submission or navigation
    if (videos.length > 0) {
      setIsPlaying(true);
    } else {
      console.warn("No video sources available. Attempting to fetch again.");
      getVideos(); // Now accessible here
    }
  };

  return (
    <div className="video-list-container">
      {(props.category === "tv" || category === "tv") && seasons.length > 0 && (
        <div className="video-controls">
          <div className="season-episode-selectors">
            <div className="selector-group">
              <label htmlFor="season-select">Season:</label>
              <select
                id="season-select"
                value={selectedSeason || ""}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="season-select"
              >
                {seasons.map((season) => (
                  <option key={season.id} value={season.season_number}>
                    {season.name || `Season ${season.season_number}`}
                  </option>
                ))}
              </select>
            </div>

            {episodes.length > 0 && (
              <div className="selector-group">
                <label htmlFor="episode-select">Episode:</label>
                <select
                  id="episode-select"
                  value={selectedEpisode || ""}
                  onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                  className="episode-select"
                >
                  {episodes.map((episode) => (
                    <option key={episode.id} value={episode.episode_number}>
                      {episode.episode_number ? `Episode ${episode.episode_number} - ` : ""}
                      {episode.name || ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button className="play-button" onClick={handlePlay} style={{ marginLeft: "10px", padding: "5px 10px" }}>
              Play
            </button>
          </div>
        </div>
      )}

      {videos.length > 0 && isPlaying && videos[currentSourceIndex] && (
        <VideoPlayer url={videos[currentSourceIndex].vidSrcUrl} />
      )}
    </div>
  );
};

export default VideoList;

const VideoPlayer = ({ url }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      const containerWidth = iframeRef.current.parentElement?.offsetWidth || 560;
      const containerHeight = iframeRef.current.parentElement?.offsetHeight || 315;
      iframeRef.current.setAttribute("width", containerWidth.toString());
      iframeRef.current.setAttribute("height", containerHeight.toString());
    }
  }, []);

  return (
    <div
      ref={iframeRef}
      dangerouslySetInnerHTML={{
        __html: adBlocker.createAdBlockedIframe(url, {
          width: "100%",
          height: "100vh",
          allow: "autoplay; fullscreen",
          autoplay: true, // Ensure autoplay is explicitly set
        }).outerHTML,
      }}
    />
  );
};