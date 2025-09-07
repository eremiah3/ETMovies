import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import tmdbApi from "../../api/tmdbApi";
import MovieCard from "../movie-card/MovieCard";
import Button, { OutlineButton } from "../button/Button";
import Input from "../input/Input";
import * as Config from "../../constants/Config";

const AnimationList = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const { keyword } = useParams();

  useEffect(() => {
    const getList = async () => {
      let response = null;
      if (keyword === undefined) {
        response = await tmdbApi.getMoviesByGenre(16, { page: 1 });
        setItems(response.results);
        setTotalPage(response.total_pages);
      } else {
        response = await tmdbApi.search("movie", { query: keyword, page: 1, with_genres: 16 });
        setItems(response.results);
        setTotalPage(response.total_pages);
      }
      setPage(1);
    };
    getList();
  }, [keyword]);

  const loadMore = async () => {
    let response = null;
    if (keyword === undefined) {
      response = await tmdbApi.getMoviesByGenre(16, { page: page + 1 });
    } else {
      response = await tmdbApi.search("movie", { query: keyword, page: page + 1, with_genres: 16 });
    }
    setItems([...items, ...response.results]);
    setPage(page + 1);
  };

  return (
    <>
      <div className="section mb-3">
        <AnimationSearch keyword={keyword} />
      </div>
      <div className="movie-grid">
        {items.map((item, index) => (
          <MovieCard key={index} category="movie" item={item} />
        ))}
      </div>
      {page < totalPage ? (
        <div className="movie-grid__loadmore">
          <OutlineButton className="small" onClick={loadMore}>
            Load more
          </OutlineButton>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

const AnimationSearch = (props) => {
  const history = useHistory();
  const [keyword, setKeyword] = useState(props.keyword ? props.keyword : "");

  const goToSearch = useCallback(() => {
    if (keyword.trim().length > 0) {
      history.push(`/${Config.HOME_PAGE}/animation/search/${keyword}`);
    }
  }, [keyword, history]);

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

export default AnimationList;
