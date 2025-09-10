// Utility for continue watching functionality using Firebase Firestore

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

export const addToContinueWatching = async (item) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const userDocRef = doc(db, 'continueWatching', user.uid);
    const userDoc = await getDoc(userDocRef);

    let watched = [];
    if (userDoc.exists()) {
      watched = userDoc.data().items || [];
    }

    // Remove if already exists
    const filtered = watched.filter(w => w.id !== item.id);
    // Add to beginning
    filtered.unshift(item);
    // Keep only last 10
    const limited = filtered.slice(0, 10);

    await setDoc(userDocRef, { items: limited });
  } catch (error) {
    console.error('Error adding to continue watching:', error);
  }
};

export const overwriteContinueWatching = async (items) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const userDocRef = doc(db, 'continueWatching', user.uid);
    await setDoc(userDocRef, { items: items });
  } catch (error) {
    console.error('Error overwriting continue watching:', error);
  }
};

export const getContinueWatching = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error('User not authenticated');
      return [];
    }

    const userDocRef = doc(db, 'continueWatching', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data().items || [];
    }

    return [];
  } catch (error) {
    console.error('Error getting continue watching:', error);
    return [];
  }
};
