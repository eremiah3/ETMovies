import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import * as Config from '../../constants/Config';
import apiConfig from '../../api/apiConfig';
import './mindblowing-movie-card.scss';

const MindblowingMovieCard = ({ item, category }) => {
  const history = useHistory();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const link = `/${Config.HOME_PAGE}/${category}/${item.id}`;

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    }
  };

  const handleClick = () => {
    history.push(link);
  };

  return (
    <div
      ref={cardRef}
      className={`mindblowing-movie-card ${isHovered ? 'hovered' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="card-container">
        {/* Background glow effect */}
        <div
          className="card-glow"
          style={{
            opacity: isHovered ? 0.8 : 0,
            transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
          }}
        ></div>

        {/* Main card */}
        <div
          className="card-main"
          style={{
            transform: isHovered
              ? `rotateY(${mousePosition.x * 0.02}deg) rotateX(${mousePosition.y * -0.02}deg) scale(1.05)`
              : 'rotateY(0deg) rotateX(0deg) scale(1)',
          }}
        >
          <div className="card-image-container">
            <img
              src={apiConfig.w500Image(item.poster_path || item.backdrop_path)}
              alt={item.title || item.name}
              className="card-image"
            />

            {/* Overlay effects */}
            <div className="card-overlay">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`star ${i < Math.floor((item.vote_average || 0) / 2) ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div className="play-button">
                <div className="play-icon">▶</div>
              </div>

              <div className="card-info">
                <h3>{item.title || item.name}</h3>
                <p>{item.release_date || item.first_air_date}</p>
                <div className="rating">
                  <span className="rating-number">{(item.vote_average || 0).toFixed(1)}</span>
                  <span className="rating-text">/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating particles */}
          <div className="floating-particles">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`particle particle-${i + 1}`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  opacity: isHovered ? 0.8 : 0.3,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Reflection effect */}
        <div
          className="card-reflection"
          style={{
            opacity: isHovered ? 0.3 : 0,
            transform: isHovered
              ? `scaleY(-1) translateY(${mousePosition.y * 0.05}px)`
              : 'scaleY(-1)',
          }}
        >
          <img
            src={apiConfig.w500Image(item.poster_path || item.backdrop_path)}
            alt=""
            className="reflection-image"
          />
        </div>
      </div>

      {/* Hover tooltip */}
      {isHovered && (
        <div className="hover-tooltip">
          <div className="tooltip-content">
            <h4>{item.title || item.name}</h4>
            <p>{item.overview?.substring(0, 100)}...</p>
            <div className="tooltip-meta">
              <span>{item.release_date || item.first_air_date}</span>
              <span>{item.vote_average?.toFixed(1)} ⭐</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindblowingMovieCard;
