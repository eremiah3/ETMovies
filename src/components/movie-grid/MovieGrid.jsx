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
  const [, setTotalPage] = useState(0);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortOrder, setSortOrder] = useState('popularity.desc'); // New state for sorting
  const { keyword } = useParams();

  useEffect(() => {
    const getGenres = async () => {
      if (props.category === category.nollywood) {
        try {
          const response = await tmdbApi.getGenres(category.movie);
          setGenres(response.genres || []);
        } catch (error) {
          console.error("Error fetching genres:", error);
        }
      }
    };
    getGenres();
  }, [props.category]);

  useEffect(() => {
    const getList = async () => {
      let response = null;
      try {
        const params = { page, with_genres: selectedGenre };
        if (keyword === undefined) {
          switch (props.category) {
            case category.movie:
              response = await tmdbApi.getMoviesList(movieType.popular, params);
              break;
            case category.animation:
              response = await tmdbApi.getMoviesByGenre(16, params);
              break;
            case category.nollywood:
              response = await tmdbApi.getNollywoodMovies(params, sortOrder); // Pass sortOrder
              break;
            default:
              response = await tmdbApi.getTvList(tvType.popular, params);
          }
        } else {
          const searchParams = { query: keyword, page: 1, with_genres: selectedGenre };
          if (props.category === category.animation) {
            response = await tmdbApi.search("movie", { ...searchParams, with_genres: 16 });
          } else if (props.category === category.nollywood) {
            response = await tmdbApi.search("movie", { ...searchParams, with_origin_country: 'NG', sort_by: sortOrder }); // Pass sortOrder
          } else {
            response = await tmdbApi.search(props.category, searchParams);
          }
        }
        if (response) {
          const filteredItems = (response.results || response.data?.data || []).filter(item => !filterTitle || item.title !== filterTitle);
          setItems(page === 1 ? filteredItems : [...items, ...filteredItems]);
          setTotalPage(response.total_pages || 1);
        } else {
          setItems([]);
          setTotalPage(1);
        }
      } catch (error) {
        console.error(`Error fetching ${props.category} grid:`, error);
        setItems([]);
        setTotalPage(0);
      }
    };
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, props.category, filterTitle, page, selectedGenre, sortOrder]); // Add sortOrder to dependencies

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
    // Toggle sort order for Nollywood category
    if (props.category === category.nollywood) {
      setSortOrder(prevSortOrder =>
        prevSortOrder === 'popularity.desc' ? 'release_date.asc' : 'popularity.desc'
      );
    }
  };

  const handleGenreChange = (e) => {
    const genreId = e.target.value ? Number(e.target.value) : null;
    setSelectedGenre(genreId);
    setPage(1); // Reset to first page when genre changes
    setItems([]); // Clear existing items
    setSortOrder('popularity.desc'); // Reset sort order when genre changes
  };

  return (
    <>
      <div className="section mb-3">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <MovieSearch category={props.category} keyword={keyword} />
          {props.category === category.nollywood && genres.length > 0 && (
            <div className="genre-filter">
              <select onChange={handleGenreChange} value={selectedGenre || ''}>
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="movie-grid">
        {items.map((item, index) => (
          <MovieCard key={index} category={props.category} item={item} />
        ))}
      </div>
      <div className="movie-grid__loadmore">
        <OutlineButton className="small" onClick={loadMore}>
          Load more
        </OutlineButton>
      </div>
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