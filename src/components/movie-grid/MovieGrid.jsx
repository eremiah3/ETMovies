import React, { useCallback, useEffect, useState } from "react";

import "./movie-grid.scss";

import { useHistory, useParams } from "react-router";

import MovieCard from "./../movie-card/MovieCard";

import tmdbApi, { category, movieType, tvType } from "../../api/tmdbApi";
import Button, { OutlineButton } from "../button/Button";
import Input from "../input/Input";

import * as Config from "./../../constants/Config";

const MovieGrid = ({ filterTitle, ...props }) => {
  const [items, setItems] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  
  // Track load more mode for Nollywood to fetch old and new movies
  const [loadMode, setLoadMode] = useState(0);

  const { keyword } = useParams();

  // Nollywood sort modes to cycle through for variety
  const nollywoodSortModes = [
    { sort_by: 'popularity.desc', name: 'Popular' },
    { sort_by: 'vote_count.desc', name: 'Most Voted' },
    { sort_by: 'primary_release_date.desc', name: 'Newest First' },
    { sort_by: 'primary_release_date.asc', name: 'Oldest First' },
    { sort_by: 'vote_average.desc', name: 'Top Rated' },
  ];

  useEffect(() => {
    const getList = async () => {
      let response = null;

      try {
        if (keyword === undefined) {
          const params = { page };
          switch (props.category) {
            case category.movie:
              response = await tmdbApi.getMoviesList(movieType.popular, params);
              break;
            case category.animation:
              // Animation genre ID 16
              response = await tmdbApi.getMoviesByGenre(16, params);
              break;
            case category.nollywood:
              // Nollywood - Nigerian movies - use first sort mode
              response = await tmdbApi.getNollywoodMovies({ ...params, ...nollywoodSortModes[0] });
              break;
            default:
              response = await tmdbApi.getTvList(tvType.popular, params);
          }
        } else {
          const params = {
            query: keyword,
            page: 1,
          };
          if (props.category === category.animation) {
            response = await tmdbApi.search("movie", { query: keyword, page: 1, with_genres: 16 });
          } else if (props.category === category.nollywood) {
            // Search for Nollywood movies - Nigerian origin
            response = await tmdbApi.search("movie", { query: keyword, page: 1, with_origin_country: 'NG' });
          } else {
            response = await tmdbApi.search(props.category, params);
          }
        }
        if (response) {
          setItems((response.results || response.data?.data || []).filter(item => !filterTitle || item.title !== filterTitle));
          setTotalPage(Math.max(response.total_pages || 1, 1));
        } else {
          setItems([]);
          setTotalPage(1);
        }
        setPage(1);
        setLoadMode(0); // Reset load mode when category changes
      } catch (error) {
        console.error(`Error fetching ${props.category} grid:`, error);
        setItems([]);
        setTotalPage(0);
      }
    };
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, props.category, filterTitle]);

  const loadMore = async () => {
    let response = null;

    try {
      if (keyword === undefined) {
        const params = { page: page + 1 };
        switch (props.category) {
          case category.movie:
            response = await tmdbApi.getMoviesList(movieType.popular, params);
            break;
          case category.animation:
            response = await tmdbApi.getMoviesByGenre(16, params);
            break;
          case category.nollywood:
            // Cycle through different sort modes to get both old and new movies
            const nextMode = (loadMode + 1) % nollywoodSortModes.length;
            const currentSort = nollywoodSortModes[nextMode];
            response = await tmdbApi.getNollywoodMovies({ 
              ...params, 
              ...currentSort,
              min_votes: 1 
            });
            setLoadMode(nextMode);
            break;
          default:
            response = await tmdbApi.getTvList(tvType.popular, params);
        }
      } else {
        const params = {
          query: keyword,
          page: page + 1,
        };
        if (props.category === category.animation) {
          response = await tmdbApi.search("movie", { query: keyword, page: page + 1, with_genres: 16 });
        } else if (props.category === category.nollywood) {
          // Cycle through different sort modes for search as well
          const nextMode = (loadMode + 1) % nollywoodSortModes.length;
          const currentSort = nollywoodSortModes[nextMode];
          response = await tmdbApi.search("movie", { 
            query: keyword, 
            page: page + 1, 
            with_origin_country: 'NG',
            sort_by: currentSort.sort_by
          });
          setLoadMode(nextMode);
        } else {
          response = await tmdbApi.search(props.category, params);
        }
      }
      if (response && response.results) {
        setItems([...items, ...(response.results || []).filter(item => !filterTitle || item.title !== filterTitle)]);
        setTotalPage(Math.max(response.total_pages || page + 1, page + 1));
        setPage(page + 1);
      }
    } catch (error) {
      console.error(`Error loading more ${props.category}:`, error);
    }
  };

  return (
    <>
      <div className="section mb-3">
        <MovieSearch category={props.category} keyword={keyword} />
      </div>
      <div className="movie-grid">
        {items.map((item, index) => (
          <MovieCard key={index} category={props.category} item={item} />
        ))}
      </div>
      {page < totalPage ? (
        <div className="movie-grid__loadmore">
          <OutlineButton className="small" onClick={loadMore}>
            Load more
          </OutlineButton>
        </div>
      ) : null}
    </>
  );
};

const MovieSearch = (props) => {
  const history = useHistory();

  const [keyword, setKeyword] = useState(props.keyword ? props.keyword : "");

  const goToSearch = useCallback(() => {
    if (keyword.trim().length > 0) {
      history.push(
        `/${Config.HOME_PAGE}/${category[props.category]}/search/${keyword}`
      );
    }
  }, [keyword, props.category, history]);

  useEffect(() => {
    const enterEvent = (e) => {
      e.preventDefault();
      if (e.keyCode === 13) {
        goToSearch();
      }
    };
    document.addEventListener("keyup", enterEvent);
    return () => {
      document.removeEventListener("keyup", enterEvent);
    };
  }, [goToSearch]);

  return (
    <div className="movie-search">
      <Input
        type="text"
        placeholder="Enter keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <Button className="small" onClick={goToSearch}>
        Search
      </Button>
    </div>
  );
};

export default MovieGrid;