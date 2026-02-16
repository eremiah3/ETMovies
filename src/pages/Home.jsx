import React from "react";
import { Link } from "react-router-dom";

import { OutlineButton } from "../components/button/Button";
import HeroSlide from "../components/hero-slide/HeroSlide";
import MovieList from "../components/movie-list/MovieList";
import AnimatedBackground from "../components/AnimatedBackground";
import ContinueWatching from "../components/continue-watching/ContinueWatching";

import { category, movieType, tvType } from "../api/tmdbApi";

import * as Config from "./../constants/Config";

const Home = () => {
  return (
    <>
      <HeroSlide />
      <AnimatedBackground variant="hero" />

      <div className="container">

        <div className="section mb-3">
          <ContinueWatching />
        </div>

        <div className="section mb-3">
          <div className="section__header mb-2">
            <h2>Trending Movies</h2>
            <Link to={`/${Config.HOME_PAGE}/movie`}>
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          <MovieList category={category.movie} type={movieType.popular} filterTitle="Demon Slayer: Kimetsu no Yaiba Infinity Castle" key="popular" />
        </div>

        <div className="section mb-3">
          <div className="section__header mb-2">
            <h2>Top Rated Movies</h2>
            <Link to={`/${Config.HOME_PAGE}/movie`}>
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          <MovieList category={category.movie} type={movieType.top_rated} filterTitle="Demon Slayer: Kimetsu no Yaiba Infinity Castle" key="top_rated" />
        </div>

        <div className="section mb-3">
          <div className="section__header mb-2">
            <h2>Trending TV</h2>
            <Link to={`/${Config.HOME_PAGE}/tv`}>
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          <MovieList category={category.tv} type={tvType.popular} />
        </div>

        <div className="section mb-3">
          <div className="section__header mb-2">
            <h2>Top Rated TV</h2>
            <Link to={`/${Config.HOME_PAGE}/tv`}>
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          <MovieList category={category.tv} type={tvType.top_rated} />
        </div>

        <div className="section mb-3">
          <div className="section__header mb-2">
            <h2>Trending Animation</h2>
            <Link to={`/${Config.HOME_PAGE}/animation`}>
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          <MovieList category={category.animation} type={movieType.popular} />
        </div>

          <div className="section mb-3">
          <div className="section__header mb-2">
            <h2>Trending Nollywood</h2>
            <Link to={`/${Config.HOME_PAGE}/nollywood`}>
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          <MovieList category={category.nollywood} type={movieType.popular} />
        </div>
      </div>
    </>
  );
};

export default Home;
