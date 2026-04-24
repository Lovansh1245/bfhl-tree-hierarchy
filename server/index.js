const express = require('express');
const cors = require('cors');
const { processData } = require('./processor');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Routes ──

// Root health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', endpoint: 'POST /bfhl' });
});

// GET /bfhl → 405 Method Not Allowed
app.get('/bfhl', (_req, res) => {
  res.status(405).json({ error: 'Method not allowed. Use POST.' });
});

// POST /bfhl → main processing endpoint
app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body || {};

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        error: '"data" field is required and must be an array'
      });
    }

    const result = processData(data);

    res.json({
      is_success: true,
      ...result
    });
  } catch (err) {
    console.error('Processing error:', err);
    res.status(500).json({ is_success: false, error: 'Internal server error' });
  }
});

// ── Error Handlers ──

// Malformed JSON body handler
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`🚀 BFHL API running on http://localhost:${PORT}`);
});
