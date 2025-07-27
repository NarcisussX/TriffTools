const express = require("express");
const router = express.Router();
const summarizeKillboard = require("../utils/killboardSummary");


router.get("/killboard-summary/:solarSystemID", async (req, res) => {
  try {
    const result = await summarizeKillboard(req.params.solarSystemID);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading killboard data");
  }
});

module.exports = router;
