import React, { useEffect, useState } from 'react';
import { getContinueWatching, overwriteContinueWatching } from '../../utils/continueWatching';
import MovieCard from '../movie-card/MovieCard';
import { SwiperSlide, Swiper } from 'swiper/react';
import { useAuth } from '../../contexts/AuthContext';
import './continue-watching.scss';

const ContinueWatching = () => {
  const [watchedItems, setWatchedItems] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchWatched = async () => {
      if (!currentUser) {
        return;
      }

      try {
        const items = await getContinueWatching();
        setWatchedItems(items);
      } catch (error) {
        console.error('Error fetching continue watching items:', error);
        setWatchedItems([]);
      }
    };

    fetchWatched();
  }, [currentUser]);

  const handleRemove = async (item) => {
    const updatedItems = watchedItems.filter(w => w.id !== item.id);
    setWatchedItems(updatedItems);
    await overwriteContinueWatching(updatedItems);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="continue-watching">
      <div className="section__header mb-2">
        <h2>Continue Watching</h2>
        {watchedItems.length > 0 && <p>{`Showing ${watchedItems.length} movies`}</p>}
      </div>
      {watchedItems.length > 0 ? (
        <div className="continue-watching__list">
          <Swiper grabCursor={true} spaceBetween={10} slidesPerView={"auto"}>
            {watchedItems.map((item, i) => (
              <SwiperSlide key={i}>
                <MovieCard item={item} category={item.category} onRemove={() => handleRemove(item)} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="continue-watching__empty">
          <p>No movies to continue watching. Start watching to see them here!</p>
        </div>
      )}
    </div>
  );
};

export default ContinueWatching;
