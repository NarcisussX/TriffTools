const express = require("express");
const cors = require("cors");
const path = require("path");
const { OpenAI } = require("openai");
const { ensureSchemaWithRetry } = require('./db');
const pollJobCostIndices = require('./utils/pollJobCostIndices');

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

// Initial run
pollJobCostIndices();

// Repeat every hour
setInterval(pollJobCostIndices, 60 * 60 * 1000);
