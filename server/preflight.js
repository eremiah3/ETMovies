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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Preflight server listening on port ${PORT}`);
});
