import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getContinueWatching } from '../../utils/continueWatching';
import MovieCard from '../movie-card/MovieCard';
import './continue-watching.scss';

const ContinueWatching = () => {
  const [watchedItems, setWatchedItems] = useState([]);

  useEffect(() => {
    const fetchWatched = async () => {
      const items = await getContinueWatching();
      setWatchedItems(items);
    };
    fetchWatched();
  }, []);

  if (watchedItems.length === 0) {
    return null;
  }

  return (
    <div className="continue-watching">
      <div className="section__header mb-2">
        <h2>Continue Watching</h2>
        <Link to="/continue-watching">
          <span className="view-more">View all</span>
        </Link>
      </div>
      <div className="continue-watching__list">
        {watchedItems.slice(0, 5).map((item, i) => (
          <MovieCard key={i} item={item} category={item.category} />
        ))}
      </div>
    </div>
  );
};

export default ContinueWatching;
