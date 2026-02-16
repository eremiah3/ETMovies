import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

// Collection name in Firestore
const COLLECTION_NAME = 'continueWatching';
const MAX_ITEMS = 20; // Maximum number of items to store
const LOCAL_STORAGE_KEY = 'continueWatching';

/**
 * Add or update a movie/show in the continue watching list
 * @param {Object} item - Movie or show object with id, title, poster_path, etc.
 * @param {string} category - Category (movie, tv, anime, nollywood)
 */
export const addContinueWatching = async (item, category) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.log('User not authenticated');
      return;
    }

    const userRef = doc(db, COLLECTION_NAME, user.uid);

    // Get current watching list with error handling
    let docSnap;
    try {
      docSnap = await getDoc(userRef);
    } catch (error) {
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        console.warn('Firestore temporarily unavailable, will retry on next action');
        return;
      }
      throw error;
    }

    let watchingList = [];

    if (docSnap.exists()) {
      watchingList = docSnap.data().items || [];
    }

    // Remove item if it already exists (to update timestamp)
    watchingList = watchingList.filter(w => w.id !== item.id);

    // Add item at the beginning with timestamp
    const newItem = {
      ...item,
      category,
      addedAt: new Date().toISOString(),
    };

    watchingList.unshift(newItem);

    // Keep only the latest MAX_ITEMS
    watchingList = watchingList.slice(0, MAX_ITEMS);

    // Save to Firestore
    await setDoc(userRef, { items: watchingList });
  } catch (error) {
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      console.warn('Cannot sync continue watching - offline mode');
    } else {
      console.error('Error adding to continue watching:', error);
    }
  }
};

/**
 * Get the continue watching list for the current user
 * @returns {Promise<Array>} Array of items being watched
 */
export const getContinueWatching = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return [];
    }

    const userRef = doc(db, COLLECTION_NAME, user.uid);

    let docSnap;
    try {
      docSnap = await getDoc(userRef);
    } catch (error) {
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        console.warn('Firestore temporarily unavailable, returning empty list');
        return [];
      }
      throw error;
    }

    if (docSnap.exists()) {
      return docSnap.data().items || [];
    }

    return [];
  } catch (error) {
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      console.warn('Cannot fetch continue watching - offline mode');
    } else {
      console.error('Error fetching continue watching:', error);
    }
    return [];
  }
};

/**
 * Subscribe to real-time updates of continue watching list
 * Combines localStorage (instant) and Firestore (sync) data
 * @param {Function} callback - Called with the items array whenever it changes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToContinueWatching = (callback) => {
  try {
    const user = auth.currentUser;

    // Always start with localStorage data for instant display
    const localItems = getContinueWatchingFromLocal();
    callback(localItems);

    if (!user) {
      // Setup localStorage listener even without user
      const handleStorageChange = () => {
        const updated = getContinueWatchingFromLocal();
        callback(updated);
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }

    const userRef = doc(db, COLLECTION_NAME, user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        // Merge Firestore data with localStorage
        const remoteItems = docSnap.exists() ? (docSnap.data().items || []) : [];
        const local = getContinueWatchingFromLocal();
        
        // Merge: prioritize locally added items (they're newer)
        const merged = [...local];
        for (const remote of remoteItems) {
          if (!merged.find(item => item.id === remote.id)) {
            merged.push(remote);
          }
        }
        
        // Sort by addedAt descending (newest first)
        merged.sort((a, b) => {
          const timeA = new Date(a.addedAt || 0).getTime();
          const timeB = new Date(b.addedAt || 0).getTime();
          return timeB - timeA;
        });
        
        const final = merged.slice(0, MAX_ITEMS);
        callback(final);
      },
      (error) => {
        if (error.code === 'unavailable' || error.message.includes('offline')) {
          console.warn('Firestore temporarily unavailable, using localStorage');
        } else {
          console.error('Error subscribing to continue watching:', error);
        }
        // Fallback to localStorage on error
        const fallback = getContinueWatchingFromLocal();
        callback(fallback);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up subscription:', error);
    return () => {};
  }
};

/**
 * Remove an item from continue watching
 * @param {number} itemId - ID of the item to remove
 */
export const removeContinueWatching = async (itemId) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    const userRef = doc(db, COLLECTION_NAME, user.uid);

    // Get current watching list
    let docSnap;
    try {
      docSnap = await getDoc(userRef);
    } catch (error) {
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        console.warn('Cannot remove item - offline mode');
        return;
      }
      throw error;
    }

    let watchingList = docSnap.data()?.items || [];

    // Remove the item
    watchingList = watchingList.filter(w => w.id !== itemId);

    // Update Firestore
    await setDoc(userRef, { items: watchingList });
  } catch (error) {
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      console.warn('Cannot sync removal - offline mode');
    } else {
      console.error('Error removing from continue watching:', error);
    }
  }
};

/**
 * Clear all items from continue watching
 */
export const clearContinueWatching = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    const userRef = doc(db, COLLECTION_NAME, user.uid);

    await setDoc(userRef, { items: [] });
  } catch (error) {
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      console.warn('Cannot clear - offline mode');
    } else {
      console.error('Error clearing continue watching:', error);
    }
  }
};

/**
 * Overwrite the entire continue watching list
 * @param {Array} items - Array of items to set
 */
export const overwriteContinueWatching = async (items) => {
  try {
    // Save to localStorage immediately for instant display
    saveContinueWatchingToLocal(items);

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    const userRef = doc(db, COLLECTION_NAME, user.uid);

    await setDoc(userRef, { items });
  } catch (error) {
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      console.warn('Cannot overwrite - offline mode');
    } else {
      console.error('Error overwriting continue watching:', error);
    }
  }
};

/**
 * Save continue watching list to localStorage for instant access
 * @param {Array} items - Array of items to save
 */
export const saveContinueWatchingToLocal = (items) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Get continue watching list from localStorage
 * @returns {Array} Array of items from localStorage
 */
export const getContinueWatchingFromLocal = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

/**
 * Remove an item from localStorage
 * @param {number} itemId - ID of the item to remove
 */
export const removeContinueWatchingFromLocal = (itemId) => {
  try {
    const items = getContinueWatchingFromLocal();
    const filtered = items.filter(w => w.id !== itemId);
    saveContinueWatchingToLocal(filtered);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * Clear continue watching from localStorage
 */
export const clearContinueWatchingFromLocal = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Add an item to localStorage immediately (for instant display)
 * @param {Object} item - Movie or show object
 * @param {string} category - Category
 */
export const addContinueWatchingToLocal = (item, category) => {
  try {
    const items = getContinueWatchingFromLocal();
    
    // Remove if already exists
    const filtered = items.filter(w => w.id !== item.id);
    
    // Add new item at beginning
    const newItem = {
      ...item,
      category,
      addedAt: new Date().toISOString(),
    };
    
    filtered.unshift(newItem);
    
    // Keep only MAX_ITEMS
    const updatedItems = filtered.slice(0, MAX_ITEMS);
    
    saveContinueWatchingToLocal(updatedItems);
    return updatedItems;
  } catch (error) {
    console.error('Error adding to localStorage:', error);
    return [];
  }
};
