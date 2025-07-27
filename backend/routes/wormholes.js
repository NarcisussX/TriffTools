const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all wormhole systems with their planets and star
router.get('/', async (req, res) => {
  try {
    const systemsRes = await pool.query('SELECT * FROM wormhole_systems ORDER BY jcode');
    const systems = systemsRes.rows;

for (const system of systems) {
const planetsRes = await pool.query(
  'SELECT * FROM planets WHERE jcode = $1 ORDER BY name',
  [system.jcode]
);

  system.planets = planetsRes.rows;
}


    res.json(systems);
  } catch (err) {
    console.error('Error fetching wormholes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// backend/routes/wormholes.js
router.get("/summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT jcode, class, effect, statics
      FROM wormhole_systems
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching wormhole summaries:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
