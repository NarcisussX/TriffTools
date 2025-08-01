const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const db = require("../db");

const blueprintData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/data/blueprints.json"), "utf8")
);


const hybridBlueprintIDs = [
  46157, 46159, 46160, 46161, 46162, 46163, 46164, 46165
];

const VALID_STATIONS = ["Jita 4-4", "Amarr VIII", "Dodixie", "Rens"];

router.post("/reaction-calc", async (req, res) => {

const {
  blueprintID,
  station = "Jita 4-4",
  inputPricingMode = "buy",
  outputPricingMode = "sell",
  reactionSkill = 0,
  structureType = "Station", // Station, Athanor, Tatara
  meRig = "None",            // Material Efficiency Rig: None, T1, T2
  teRig = "None",            // Time Efficiency Rig: None, T1, T2
  systemCostIndex = 0,       // %
  facilityTaxPercent = 0,     // %
  securityStatus = "low"  // "low" | "null" | "wh"
} = req.body;


  if (!hybridBlueprintIDs.includes(blueprintID)) {
    return res.status(400).json({ error: "Unsupported or invalid blueprint ID." });
  }

  if (!VALID_STATIONS.includes(station)) {
    return res.status(400).json({ error: "Unsupported station name." });
  }

  const blueprint = blueprintData[blueprintID];
  const inputs = blueprint?.materials?.["11"] || [];
  const outputs = blueprint?.products?.["11"] || [];

  if (!inputs.length || !outputs.length) {
    return res.status(500).json({ error: "Blueprint is missing input or output data." });
  }

  const typeIDs = [...inputs, ...outputs].map((item) => item.typeID);

  try {
    const { rows: priceRows } = await db.query(
      `SELECT type_id, sell_price, buy_price, avg_price FROM market_prices
       WHERE type_id = ANY($1) AND station = $2`,
      [typeIDs, station]
    );

    const prices = {};
    for (const row of priceRows) {
      prices[row.type_id] = {
        sell: Number(row.sell_price),
        buy: Number(row.buy_price),
        avg: Number(row.avg_price)
      };
    }

let materialMult = 1;
let timeMult = 1;

// Base Rig Effects (no bonus yet)
if (structureType !== "Station") {
  if (meRig === "T1") materialMult *= 0.98;
  else if (meRig === "T2") materialMult *= 0.976;

  if (teRig === "T1") timeMult *= 0.80;
  else if (teRig === "T2") timeMult *= 0.76;
}

// Tatara inherent structure bonus
if (structureType === "Tatara") {
  timeMult *= 0.75;
}

// Security-based rig enhancement (1.1x bonus in nullsec or WH)
if (["null", "wh"].includes(securityStatus)) {
  const rigBonus = 1.1;

  // Only apply bonus if rig reduced the value (i.e. not 1)
  if (materialMult < 1) {
    const baseReduction = 1 - materialMult;
    materialMult = 1 - baseReduction * rigBonus;
  }

  if (timeMult < 1) {
    const baseReduction = 1 - timeMult;
    timeMult = 1 - baseReduction * rigBonus;
  }
}

// Base reaction time is 3 hours per run (in seconds)
const baseSecondsPerRun = 3 * 60 * 60; // 10,800

// Skill-based time reduction (4% per level)
const skillReductionMult = 1 - (reactionSkill * 0.04);

// Final adjusted time per run (in seconds)
const secondsPerRun = baseSecondsPerRun * timeMult * skillReductionMult;


let inputCost = 0;
let eiv = 0;

for (const input of inputs) {
  const adjustedPrices = JSON.parse(fs.readFileSync(path.join(__dirname, "../cache/adjusted_prices.json"), "utf8"));

  const marketPrice = prices[input.typeID]?.[inputPricingMode] ?? 0;
  inputCost += marketPrice * input.quantity * materialMult;
  
  const adjusted = adjustedPrices?.prices?.[String(input.typeID)]?.adjusted ?? 0;
  eiv += adjusted * input.quantity;
}

let outputValue = 0;
for (const output of outputs) {
  const unitPrice = prices[output.typeID]?.[outputPricingMode] ?? 0;
  outputValue += unitPrice * output.quantity;
}
    const installCost = eiv * (systemCostIndex / 100);
    const facilityTax = eiv * (facilityTaxPercent / 100);
    const sccTax = eiv * 0.04;
    const totalTaxes = installCost + facilityTax + sccTax;
    const profit = outputValue - inputCost - totalTaxes;
    const iskPerHour = profit / timeMult;
    const profitLessTaxes = outputValue - inputCost;


res.json({
  blueprintID,
  blueprintName: blueprint.blueprintName,
  station,
  inputPricingMode,
  outputPricingMode,
  reactionSkill,
  structureType,
  meRig,
  teRig,
  systemCostIndex,
  facilityTaxPercent,
  securityStatus,
  timePerRun: (1 * timeMult).toFixed(2),
  inputCost: Math.round(inputCost),
  outputValue: Math.round(outputValue),
  profit: Math.round(profit),
  profitLessTaxes: Math.round(profitLessTaxes),
  iskPerHour: Math.round(iskPerHour),
  totalTaxes: Math.round(totalTaxes),
  estimatedItemValue: Math.round(eiv),
  jobInstallCost: Math.round(installCost),
  facilityTax: Math.round(facilityTax),
  sccTax: Math.round(sccTax),
  inputs,
  outputs,
  prices,
  secondsPerRun: Math.round(secondsPerRun),
  formattedDuration: new Date(secondsPerRun * 1000).toISOString().substr(11, 8)
});

  } catch (err) {
    console.error("ReactionCalc error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
