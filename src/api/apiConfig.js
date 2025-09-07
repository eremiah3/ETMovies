const apiConfig = {
  baseUrl: "https://api.themoviedb.org/3/",
  apiKey: "67d7fe73e007c485f445b19d22c52201",
  originalImage: (imgPath) => `https://image.tmdb.org/t/p/original/${imgPath}`,
  w500Image: (imgPath) => `https://image.tmdb.org/t/p/w500/${imgPath}`,
};

export default apiConfig;
