import React, { useEffect, useState } from "react";

import { useParams } from "react-router";

import tmdbApi from "../../api/tmdbApi";
import apiConfig from "../../api/apiConfig";

const CastList = (props) => {
  const { category } = useParams();

  const [casts, setCasts] = useState([]);

  useEffect(() => {
    const getCredits = async () => {
      try {
        const apiCategory = category === "nollywood" ? "movie" : category;
        const res = await tmdbApi.credits(apiCategory, props.id);
        if (res && res.cast) {
          setCasts(res.cast.slice(0, 5));
        } else {
          setCasts([]);
        }
      } catch (error) {
        console.error(`Error fetching credits for ${category}/${props.id}:`, error);
        setCasts([]);
      }
    };
    getCredits();
  }, [category, props.id]);

  return (
    <div className="casts">
      {casts.map((cast, index) => (
        <div key={index} className="casts__item">
          <div
            className="casts__item__img"
            style={{
              backgroundImage: `url(${apiConfig.w500Image(cast.profile_path)})`,
            }}
          ></div>
          <p className="casts__item__name">{cast.name}</p>
        </div>
      ))}
    </div>
  );
};

export default CastList;
