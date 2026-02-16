import React, { useEffect, useState } from 'react';
import { subscribeToContinueWatching, overwriteContinueWatching, getContinueWatchingFromLocal } from '../../utils/continueWatching';
import MovieCard from '../movie-card/MovieCard';
import { SwiperSlide, Swiper } from 'swiper/react';
import { useAuth } from '../../contexts/AuthContext';
import './continue-watching.scss';

const ContinueWatching = () => {
  const [watchedItems, setWatchedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      // Load from localStorage even without user for guest viewing
      const localItems = getContinueWatchingFromLocal();
      setWatchedItems(localItems);
      return;
    }

    // Subscribe to real-time updates (combines localStorage + Firestore)
    const unsubscribe = subscribeToContinueWatching((items) => {
      setWatchedItems(items || []);
      setLoading(false);
    });

    // Also listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'continueWatching') {
        const updated = getContinueWatchingFromLocal();
        setWatchedItems(updated);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
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
      {loading ? (
        <div className="continue-watching__loading">
          <p>Loading your history...</p>
        </div>
      ) : watchedItems.length > 0 ? (
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
