// Utility for continue watching functionality using IP address

const getUserIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'unknown';
  }
};

const getStorageKey = async () => {
  const ip = await getUserIP();
  return `continueWatching_${ip}`;
};

export const addToContinueWatching = async (item) => {
  const key = await getStorageKey();
  const watched = JSON.parse(localStorage.getItem(key) || '[]');
  // Remove if already exists
  const filtered = watched.filter(w => w.id !== item.id);
  // Add to beginning
  filtered.unshift(item);
  // Keep only last 10
  const limited = filtered.slice(0, 10);
  localStorage.setItem(key, JSON.stringify(limited));
};

export const getContinueWatching = async () => {
  const key = await getStorageKey();
  return JSON.parse(localStorage.getItem(key) || '[]');
};
