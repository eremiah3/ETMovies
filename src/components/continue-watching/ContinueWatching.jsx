import React, { useEffect, useState } from 'react';
import { getContinueWatching, overwriteContinueWatching } from '../../utils/continueWatching';
import MovieCard from '../movie-card/MovieCard';
import { SwiperSlide, Swiper } from 'swiper/react';
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

  const handleRemove = async (item) => {
    const updatedItems = watchedItems.filter(w => w.id !== item.id);
    setWatchedItems(updatedItems);
    await overwriteContinueWatching(updatedItems);
  };

  if (watchedItems.length === 0) {
    return null;
  }

  return (
    <div className="continue-watching">
      <div className="section__header mb-2">
        <h2>Continue Watching</h2>
      </div>
      <div className="continue-watching__list">
        <Swiper grabCursor={true} spaceBetween={10} slidesPerView={"auto"}>
          {watchedItems.map((item, i) => (
            <SwiperSlide key={i}>
              <MovieCard item={item} category={item.category} onRemove={() => handleRemove(item)} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ContinueWatching;
