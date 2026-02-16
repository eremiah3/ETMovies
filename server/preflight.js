const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple preflight endpoint: accepts { urls: [] } and returns { okUrl: string | null }
app.post('/preflight', async (req, res) => {
  const { urls } = req.body || {};
  if (!Array.isArray(urls) || urls.length === 0) return res.status(400).json({ okUrl: null });

  for (const u of urls) {
    try {
      // Try HEAD first
      await axios.head(u, { timeout: 4000 });
      return res.json({ okUrl: u });
    } catch (headErr) {
      try {
        // Fallback to GET of first byte (some servers block HEAD)
        await axios.get(u, { timeout: 4000, headers: { Range: 'bytes=0-0' } });
        return res.json({ okUrl: u });
      } catch (getErr) {
        // continue to next url
      }
    }
  }

  // none worked
  return res.json({ okUrl: null });
});

// Simple YouTube search endpoint (no API key).
// Accepts { query: string } and returns { videoId: string | null, url: string | null }
app.post('/youtube-search', async (req, res) => {
  const { query } = req.body || {};
  if (!query || typeof query !== 'string') return res.status(400).json({ videoId: null, url: null });

  try {
    const resp = await axios.get('https://www.youtube.com/results', {
      params: { search_query: query },
      timeout: 6000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Preflight/1.0)' },
    });

    const body = resp.data || '';

    // Look for the structured videoId token that appears in YouTube page JSON
    const m = body.match(/"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/);
    if (m && m[1]) {
      const id = m[1];
      return res.json({ videoId: id, url: `https://www.youtube.com/watch?v=${id}` });
    }

    // Fallback: search for /watch?v= links in HTML
    const m2 = body.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (m2 && m2[1]) {
      const id = m2[1];
      return res.json({ videoId: id, url: `https://www.youtube.com/watch?v=${id}` });
    }

    return res.json({ videoId: null, url: null });
  } catch (err) {
    return res.status(500).json({ videoId: null, url: null });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Preflight server listening on port ${PORT}`);
});
