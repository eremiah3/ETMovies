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

  const { keyword } = useParams();

  useEffect(() => {
    const getList = async () => {
      let response = null;

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
            // Nollywood - Nigerian movies
            response = await tmdbApi.getNollywoodMovies(params);
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
          // Search for Nollywood movies - strictly Nigerian productions
          response = await tmdbApi.search("movie", { query: keyword, page: 1, with_origin_country: 'NG' });
        } else {
          response = await tmdbApi.search(props.category, params);
        }
      }
      setItems((response.results || response.data?.data || []).filter(item => !filterTitle || item.title !== filterTitle));
      setTotalPage(response.total_pages || 0);
      setPage(1);
    };
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, props.category, filterTitle]);

  const loadMore = async () => {
    let response = null;

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
          // Nollywood - Nigerian movies
          response = await tmdbApi.getNollywoodMovies(params);
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
        // Search for Nollywood movies - strictly Nigerian productions
        response = await tmdbApi.search("movie", { query: keyword, page: page + 1, with_origin_country: 'NG' });
      } else {
        response = await tmdbApi.search(props.category, params);
      }
    }
    setItems([...items, ...(response.results || response.data?.data || []).filter(item => !filterTitle || item.title !== filterTitle)]);
    setPage(page + 1);
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