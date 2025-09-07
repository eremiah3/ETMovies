import React from "react";
import AnimeList from "../components/anime-list/AnimeList";
import PageHeader from "../components/page-header/PageHeader";

const Anime = () => {
  return (
    <>
      <PageHeader>
        Anime
      </PageHeader>
      <div className="container">
        <div className="section mb-3">
          <AnimeList />
        </div>
      </div>
    </>
  );
};

export default Anime;
