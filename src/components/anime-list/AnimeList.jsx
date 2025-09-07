import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import jikanApi from "../../api/jikanApi";
import MovieCard from "../movie-card/MovieCard";
import Button, { OutlineButton } from "../button/Button";
import Input from "../input/Input";
import * as Config from "../../constants/Config";

const AnimeList = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const { keyword } = useParams();

  useEffect(() => {
    const getList = async () => {
      let response = null;
      if (keyword === undefined) {
        response = await jikanApi.getAnimeList({ limit: 20, order_by: "popularity", page: 1 });
        setItems(response.data.data);
        setTotalPage(Math.ceil(response.data.pagination.items.total / 20));
      } else {
        response = await jikanApi.searchAnime(keyword, { limit: 20, page: 1 });
        setItems(response.data.data);
        setTotalPage(Math.ceil(response.data.pagination.items.total / 20));
      }
    };
    getList();
  }, [keyword]);

  const loadMore = async () => {
    let response = null;
    if (keyword === undefined) {
      response = await jikanApi.getAnimeList({ limit: 20, order_by: "popularity", page: page + 1 });
    } else {
      response = await jikanApi.searchAnime(keyword, { limit: 20, page: page + 1 });
    }
    setItems([...items, ...response.data.data]);
    setPage(page + 1);
  };

  return (
    <>
      <div className="section mb-3">
        <AnimeSearch keyword={keyword} />
      </div>
      <div className="movie-grid">
        {items.map((item, index) => {
          const mappedItem = {
            ...item,
            poster_path: item.images.jpg.image_url,
            title: item.title,
            id: item.mal_id,
          };
          return <MovieCard key={index} category="anime" item={mappedItem} />;
        })}
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

const AnimeSearch = (props) => {
  const history = useHistory();
  const [keyword, setKeyword] = useState(props.keyword ? props.keyword : "");

  const goToSearch = useCallback(() => {
    if (keyword.trim().length > 0) {
      history.push(`/${Config.HOME_PAGE}/anime/search/${keyword}`);
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

export default AnimeList;
