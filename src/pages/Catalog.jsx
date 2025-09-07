import React from "react";

import { useParams } from "react-router";
import MovieGrid from "../components/movie-grid/MovieGrid";

import PageHeader from "../components/page-header/PageHeader";

import { category as cate } from "./../api/tmdbApi";

const Catalog = () => {
  const { category } = useParams();


  const getCategoryTitle = (category) => {
    switch (category) {
      case cate.movie:
        return "Movies";
      case cate.tv:
        return "TV Shows";
      case cate.anime:
        return "Anime";
      case cate.animation:
        return "Animation";
      default:
        return "Catalog";
    }
  };

  return (
    <>
      <PageHeader>{getCategoryTitle(category)}</PageHeader>

      <div className="container">
        <div className="section mb-3">
          <MovieGrid category={category} />
        </div>
      </div>
    </>
  );
};

export default Catalog;
