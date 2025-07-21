// backend/routes/industryBlueprints.js
const express = require('express');
const router = express.Router();
const blueprints = require('./data/blueprints.json');

router.get('/blueprints', (req, res) => {
  // You may want to send just an array of { blueprintID, blueprintName }
  const bps = Object.entries(blueprints).map(([id, bp]) => ({
    blueprintID: id,
    blueprintName: bp.blueprintName
  }));
  res.json(bps);
});

module.exports = router;
