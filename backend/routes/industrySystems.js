// backend/routes/industrySystems.js
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/systems', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT solar_system_id, COALESCE(system_name, solar_system_id::text) AS system_name
      FROM industry_job_costs
      ORDER BY system_name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching industry systems:', err);
    res.status(500).json({ error: 'Failed to load industry systems' });
  }
});

module.exports = router;
