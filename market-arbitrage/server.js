// server.js

require('dotenv').config();
const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3002;

// Ensure DB schema on startup
(async () => {
  await db.ensureSchema();

  app.use(express.json());

  // Get latest prices for list of type_ids (optionally filter by station)
  app.get('/api/market/latest', async (req, res) => {
    const { type_ids, station } = req.query;
    try {
      let filter = [];
      let params = [];
      if (type_ids) {
        const ids = type_ids.split(',').map(Number);
        filter.push(`type_id = ANY($1)`);
        params.push(ids);
      }
      if (station) {
        filter.push(`station = $${params.length + 1}`);
        params.push(station);
      }

      const query = `
        SELECT DISTINCT ON (type_id, station)
          id, type_id, station, buy_price, sell_price, avg_price, fetched_at
        FROM market_prices
        ${filter.length ? 'WHERE ' + filter.join(' AND ') : ''}
        ORDER BY type_id, station, fetched_at DESC
      `;
      const { rows } = await db.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error('Error in /api/market/latest:', err);
      res.status(500).json({ error: 'Failed to fetch latest prices.' });
    }
  });

  // Get price history for charting, etc
  app.get('/api/market/history', async (req, res) => {
    // Example: /api/market/history?type_id=30375&station=The%20Forge&hours=24
    const { type_id, station, hours = 24 } = req.query;
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      const { rows } = await db.query(
        `SELECT * FROM market_prices WHERE type_id=$1 AND station=$2 AND fetched_at >= $3 ORDER BY fetched_at ASC`,
        [type_id, station, since]
      );
      res.json(rows);
    } catch (err) {
      console.error('Error in /api/market/history:', err);
      res.status(500).json({ error: 'Failed to fetch price history.' });
    }
  });

  app.listen(PORT, () => {
    console.log(`Market Arbitrage API running on port ${PORT}`);
  });
})();
