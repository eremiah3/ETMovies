const vidsrcApi = {
  // Get streaming URL for movies with multiple fallbacks
  getMovieStream: (movieId) => {
    // Primary sources with fallbacks using official VidSrc domains
    const sources = [
      { url: `https://vidsrcme.ru/embed/movie/${movieId}`, source: "vidsrcme.ru" },
      { url: `https://vidsrcme.su/embed/movie/${movieId}`, source: "vidsrcme.su" },
      { url: `https://vidsrc-me.su/embed/movie/${movieId}`, source: "vidsrc-me.su" },
      { url: `https://vidsrc-embed.ru/embed/movie/${movieId}`, source: "vidsrc-embed.ru" },
      { url: `https://www.cloudstream.pro/embed/movie/${movieId}`, source: "cloudstream pro" }
    ];

    return sources;
  },

  // Get streaming URL for TV shows with multiple fallbacks
  getTvStream: (tvId, season = 1, episode = 1) => {
    const sources = [
      { url: `https://vidsrcme.ru/embed/tv/${tvId}/${season}/${episode}`, source: "vidsrcme.ru" },
      { url: `https://vidsrcme.ru/embed/tv/${tvId}/${season}/${episode}`, source: "vidsrcme.ru" },
      { url: `https://vidsrcme.ru/embed/tv/${tvId}/${season}/${episode}`, source: "vidsrcme.ru" },
      { url: `https://vidsrcme.ru/embed/tv/${tvId}/${season}/${episode}`, source: "vidsrcme.ru" },
      { url: `https://www.cloudstream.pro/embed/tv/${tvId}/${season}/${episode}`, source: "cloudstream pro" }
    ];

    return sources;
  },

  // Get the best available stream (first working source)
  getBestStream: async (type, id, season = 1, episode = 1) => {
    const sources = type === "movie"
      ? vidsrcApi.getMovieStream(id)
      : vidsrcApi.getTvStream(id, season, episode);

    // For now, return the first source. In a real implementation,
    // you could test each source for availability
    return sources[0];
  }
};

export default vidsrcApi;
