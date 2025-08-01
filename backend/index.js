const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const { OpenAI } = require("openai");
const { ensureSchemaWithRetry } = require('./db');
const pollJobCostIndices = require('./utils/pollJobCostIndices');
const { fetchAdjustedPrices } = require("./utils/fetchAdjustedPrices");

require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
const gasCalcRoute = require("./routes/gasCalc");
app.use(gasCalcRoute);
const piCalcRoute = require("./routes/piCalc");
app.use(piCalcRoute);
const blueLootCalc = require("./routes/blueLootCalc");
app.use(blueLootCalc); 
const industryCalc = require('./routes/industryCalc');
app.use('/api/industry', industryCalc);
const industryBlueprints = require('./routes/industryBlueprints');
app.use('/api/industry', industryBlueprints);
const industrySystems = require('./routes/industrySystems');
app.use('/api/industry', industrySystems);
app.use("/api/data", express.static(path.join(__dirname, "routes", "data")));
const oreCalcRoute = require('./routes/oreCalc');
app.use('/api', oreCalcRoute);
const wormholesRoute = require('./routes/wormholes');
app.use('/api/wormholes', wormholesRoute);
const killboardRoutes = require("./routes/killboard");
app.use("/api", killboardRoutes);
const reactionCalc = require("./routes/reactionCalc");
app.use("/api", reactionCalc);



const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

ensureSchemaWithRetry()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('🔥 Failed to ensure schema, exiting.');
    process.exit(1);
  });

app.post("/api/chat", async (req, res) => {
  try {
    const userMessages = req.body.messages || [];
    const messages = [
      {
        role: "system",
        content:
          "You are Triffnix AI, an AI powerhouse built by Triffnix designed with a focus on deep, ACCURATE and up-todate info on EVE Online. You do not mention OpenAI.",
      },
      ...userMessages,
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    res.json(completion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat failed" });
  }
});

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});


pollJobCostIndices();
setInterval(pollJobCostIndices, 60 * 60 * 1000);

const CACHE_PATH = path.join(__dirname, "cache", "adjusted_prices.json");

// Refresh if cache is missing or older than 24 hours
const shouldUpdateAdjustedPrices = () => {
  if (!fs.existsSync(CACHE_PATH)) return true;
  const stats = fs.statSync(CACHE_PATH);
  const ageMs = Date.now() - stats.mtimeMs;
  return ageMs > 24 * 60 * 60 * 1000; // 24 hours
};

(async () => {
  if (shouldUpdateAdjustedPrices()) {
    console.log("[Adjusted Prices] Updating cache...");
    try {
      await fetchAdjustedPrices();
      console.log("[Adjusted Prices] Cache updated.");
    } catch (err) {
      console.error("[Adjusted Prices] Failed to update:", err);
    }
  } else {
    console.log("[Adjusted Prices] Cache is fresh.");
  }
})();