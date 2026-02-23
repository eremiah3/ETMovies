const vidsrcApi = {
  // Get streaming URL for movies with multiple fallbacks
  // Accepts optional imdbId for additional streaming services that use IMDB
  getMovieStream: (movieId, imdbId) => {
    // Primary sources with fallbacks using official VidSrc domains (TMDB ID)
    let sources = [
      { url: `https://vidsrcme.ru/embed/movie/${movieId}`, source: "vidsrcme.ru" },
      { url: `https://vidsrcme.su/embed/movie/${movieId}`, source: "vidsrcme.su" },
      { url: `https://vidsrc-me.su/embed/movie/${movieId}`, source: "vidsrc-me.su" },
      { url: `https://vidsrc-embed.ru/embed/movie/${movieId}`, source: "vidsrc-embed.ru" },
      { url: `https://www.cloudstream.pro/embed/movie/${movieId}`, source: "cloudstream pro" },
      { url: `https://vidguard.xyz/embed/movie/${movieId}`, source: "vidguard.xyz" },
      { url: `https://streamwish.to/embed/movie/${movieId}`, source: "streamwish.to" },
      { url: `https://filemoon.sx/embed/movie/${movieId}`, source: "filemoon.sx" }
    ];

    // Add additional streaming services that use IMDB ID if available
    if (imdbId) {
      const imdbSources = [
        { url: `https://2embed.cc/embed/movie?imdb=${imdbId}`, source: "2embed.cc" },
        { url: `https://2embed.stream/embed/movie?imdb=${imdbId}`, source: "2embed.stream" },
        { url: `https://2embed.org/embed/movie?imdb=${imdbId}`, source: "2embed.org" },
        { url: `https://superembed.stream/embed/movie?imdb=${imdbId}`, source: "superembed.stream" },
        { url: `https://embedmaster.com/embed/movie?imdb=${imdbId}`, source: "embedmaster.com" },
        { url: `https://vidguard.xyz/embed/movie?imdb=${imdbId}`, source: "vidguard.xyz (IMDB)" },
        { url: `https://streamwish.to/embed/movie?imdb=${imdbId}`, source: "streamwish.to (IMDB)" },
        { url: `https://filemoon.sx/embed/movie?imdb=${imdbId}`, source: "filemoon.sx (IMDB)" }
      ];
      sources = [...sources, ...imdbSources];
    }

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
,

  // Server-assisted YouTube fallback (no API key required).
  // Accepts a title/query string and returns an array of sources compatible with the rest of the app.
  getYouTubeFallback: async (query) => {
    if (!query) return [];
    try {
      // First ask local server to search YouTube and return a videoId
      const resp = await fetch('http://localhost:4000/youtube-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!resp.ok) return [];
      const j = await resp.json();
      const videoId = j && j.videoId;
      if (!videoId) return [];

      // Try YouTube oEmbed endpoint for nicer metadata and to verify availability
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
        const oe = await fetch(oembedUrl, { method: 'GET' });
        if (oe.ok) {
          const meta = await oe.json();
          return [{
            url: `https://www.youtube.com/embed/${videoId}`,
            source: 'youtube',
            title: meta.title,
            provider: meta.provider_name,
            thumbnail: meta.thumbnail_url,
          }];
        }
      } catch (err) {
        // ignore oEmbed failures and fall back to embed URL
      }

      return [{ url: `https://www.youtube.com/embed/${videoId}`, source: 'youtube' }];
    } catch (err) {
      return [];
    }
  }
};

export default vidsrcApi;
