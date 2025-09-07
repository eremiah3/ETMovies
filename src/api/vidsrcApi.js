const vidsrcApi = {
  // Get streaming URL for movies with multiple fallbacks
  getMovieStream: (movieId) => {
    // Primary sources with fallbacks using official VidSrc domains
    const sources = [
      { url: `https://vidsrc.in/embed/movie/${movieId}`, source: "vidsrc.in" },
      { url: `https://vidsrc.pm/embed/movie/${movieId}`, source: "vidsrc.pm" },
      { url: `https://vidsrc.xyz/embed/movie/${movieId}`, source: "vidsrc.xyz" },
      { url: `https://vidsrc.net/embed/movie/${movieId}`, source: "vidsrc.net" },
      { url: `https://www.cloudstream.pro/embed/movie/${movieId}`, source: "cloudstream pro" }
    ];

    return sources;
  },

  // Get streaming URL for TV shows with multiple fallbacks
  getTvStream: (tvId, season = 1, episode = 1) => {
    const sources = [
      { url: `https://vidsrc.in/embed/tv/${tvId}/${season}/${episode}`, source: "vidsrc.in" },
      { url: `https://vidsrc.pm/embed/tv/${tvId}/${season}/${episode}`, source: "vidsrc.pm" },
      { url: `https://vidsrc.xyz/embed/tv/${tvId}/${season}/${episode}`, source: "vidsrc.xyz" },
      { url: `https://vidsrc.net/embed/tv/${tvId}/${season}/${episode}`, source: "vidsrc.net" },
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
