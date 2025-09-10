import React, { useEffect, useRef, useState } from "react";

import { useParams } from "react-router";

import tmdbApi from "../../api/tmdbApi";
import vidsrcApi from "../../api/vidsrcApi";
import adBlocker from "../../utils/adBlocker";
import { addToContinueWatching } from "../../utils/continueWatching";

const VideoList = (props) => {
  const { category } = useParams();

  const [videos, setVideos] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  useEffect(() => {
    const getVideos = async () => {
      if (props.category === "movie" || category === "movie") {
        const sources = vidsrcApi.getMovieStream(props.id);
        setVideos([{
          id: props.id,
          name: "Full Movie",
          key: props.id,
          vidSrcUrl: sources[0].url,
          source: sources[0].source,
          allSources: sources
        }]);
      } else if (props.category === "tv" || category === "tv") {
        const season = selectedSeason || props.season || 1;
        const episode = selectedEpisode || props.episode || 1;
        const sources = vidsrcApi.getTvStream(props.id, season, episode);
        setVideos([{
          id: props.id,
          name: "Full Episode",
          key: props.id,
          vidSrcUrl: sources[0].url,
          source: sources[0].source,
          allSources: sources
        }]);
      } else {
        const sources = vidsrcApi.getMovieStream(props.id);
        setVideos([{
          id: props.id,
          name: "Full Movie",
          key: props.id,
          vidSrcUrl: sources[0].url,
          source: sources[0].source,
          allSources: sources
        }]);
      }
    };
    getVideos();
  }, [category, props.category, props.id, selectedSeason, selectedEpisode, props.season, props.episode]);

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
            setSelectedEpisode(episodesResponse.episodes[0].id);
          }
        } catch (error) {
          console.error("Error fetching episodes:", error);
        }
      }
    };
    getEpisodes();
  }, [props.category, category, props.id, selectedSeason]);

  return (
    <>
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
                    <option key={episode.id} value={episode.id}>
                      {episode.name || `Episode ${episode.episode_number}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {videos.length > 0 ? (
        videos.map((videoItem, index) => (
          <Video
            key={index}
            item={videoItem}
            category={props.category || category}
            id={props.id}
            season={selectedSeason}
            episode={selectedEpisode}
            movieItem={props.item}
          />
        ))
      ) : null}
    </>
  );
};

const Video = (props) => {
  const item = props.item;
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [sources, setSources] = useState([]);

  const iframeRef = useRef(null);

  useEffect(() => {
    // Use sources from the item prop
    if (item.allSources) {
      setSources(item.allSources);
    }
  }, [item.allSources]);



  useEffect(() => {
    // Set full width and height for video player
    if (iframeRef.current) {
      const containerWidth = iframeRef.current.parentElement?.offsetWidth || 560;
      const containerHeight = iframeRef.current.parentElement?.offsetHeight || 315;
      iframeRef.current.setAttribute("width", containerWidth.toString());
      iframeRef.current.setAttribute("height", containerHeight.toString());
    }

    // Add to continue watching when video is loaded
    if (props.movieItem) {
      addToContinueWatching({ ...props.movieItem, category: props.category });
    }
  }, [props.movieItem, props.category]);

  const handleIframeError = () => {
    // Try next source if available
    if (currentSourceIndex < sources.length - 1) {
      setCurrentSourceIndex(currentSourceIndex + 1);
    }
  };

  const currentSource = sources[currentSourceIndex];

  return (
    <div className="video">
      <div className="video__title">
        <h2>{item.name}</h2>
      </div>
      {currentSource && (
        <div ref={iframeRef} dangerouslySetInnerHTML={{__html: adBlocker.createAdBlockedIframe(currentSource.url, {
            width: '100%',
            height: '400px'
          }).outerHTML}} />
      )}
    </div>
  );
};

export default VideoList;
