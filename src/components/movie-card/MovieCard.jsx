import React from "react";

import "./movie-card.scss";

import { Link } from "react-router-dom";

import Button from "../button/Button";

import { category } from "../../api/tmdbApi";
import apiConfig from "../../api/apiConfig";
import * as Config from "./../../constants/Config";

const MovieCard = (props) => {
  const item = props.item;

  const link =
    "/" + Config.HOME_PAGE + "/" + category[props.category] + "/" + item.id;

  // Use the image URL directly if it starts with http or https, else use apiConfig.w500Image
  const bg =
    item.poster_path && (item.poster_path.startsWith("http") || item.poster_path.startsWith("https"))
      ? item.poster_path
      : apiConfig.w500Image(item.poster_path || item.backdrop_path);

  return (
    <div className="movie-card-container">
      <Link to={link}>
        <div className="movie-card" style={{ backgroundImage: `url(${bg})` }}>
          <Button>
            <i className="bx bx-play"></i>
          </Button>
          {props.onRemove && (
            <button className="remove-button" onClick={(e) => { e.preventDefault(); props.onRemove(); }}>
              <i className="bx bx-x"></i>
            </button>
          )}
        </div>
        <h3>{item.title || item.name}</h3>
      </Link>
    </div>
  );
};

export default MovieCard;
