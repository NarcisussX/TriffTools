// piCalc.js
const axios = require("axios");
const PI_ITEMS = require('./data/pi_items');

const TIERS = ["P1", "P2", "P3", "P4"];
const PI_MAP = {};
PI_ITEMS.forEach(item => PI_MAP[item.id] = item);

let PRICES = {};

async function fetchPrices() {
  const ids = PI_ITEMS.map(x => x.id).join(",");
  const url = `https://market.fuzzwork.co.uk/aggregates/?station=60003760&types=${ids}`;
  let res;
  try {
    res = await axios.get(url);
  } catch (err) {
    console.error("FUZZWORKS FETCH FAILED:", err?.response?.data || err.message || err);
    throw err;
  }
  const data = res.data;
  Object.keys(data).forEach(typeId => {
    PRICES[parseInt(typeId)] = {
      buy: Number(data[typeId].buy.max),
      sell: Number(data[typeId].sell.min),
    };
  });
}

// --- CORRECT RECURSION: Calculate total P0 cost for a batch of an item ---
function getP0CostBatch(item, inputPriceMode) {
  // For P1: Only direct P0s. No recursion, no batch math.
  if (item.tier === "P1") {
    let total = 0;
    if (item.recipe && item.recipe.length) {
      for (const ingredient of item.recipe) {
        const price = PRICES[ingredient.id]?.[inputPriceMode] || 0;
        const amt = ingredient.amt;
        total += price * amt;
      }
    }
    return total;
  }
  // For higher tiers (P2+): full recursion
  if (!item.recipe || item.recipe.length === 0) return 0;
  let total = 0;
  for (const ingredient of item.recipe) {
    const ingItem = PI_MAP[ingredient.id];
    if (!ingItem) continue;
    if (ingItem.tier === "P0") {
      total += (PRICES[ingredient.id]?.[inputPriceMode] || 0) * ingredient.amt;
    } else {
      // Need this many *batches* of the input for one batch of the current item
      const batchesNeeded = ingredient.amt / ingItem.quantity;
      total += getP0CostBatch(ingItem, inputPriceMode) * batchesNeeded;
    }
  }
  return total;
}


// Calculate last-step (previous tier → this) input cost for batch
function getLastStepCostBatch(item, inputPriceMode) {
  if (!item.recipe || item.recipe.length === 0) return 0;
  let sum = 0;
  for (const ingredient of item.recipe) {
    sum += (PRICES[ingredient.id]?.[inputPriceMode] || 0) * ingredient.amt;
  }
  return sum;
}

async function piCalcApi(req, res) {
  if (Object.keys(PRICES).length < 10) await fetchPrices();
  const { taxRate = 10, marketMode = "sell" } = req.body;

  // ------ Patch: Set price modes for this request ------
  let outputPriceMode = marketMode;
  let inputPriceMode = marketMode;
  if (marketMode === "impatient") {
    outputPriceMode = "buy";     // selling to buy orders
    inputPriceMode = "sell";     // buying mats from sell orders
  }
  if (marketMode === "patient") {
    outputPriceMode = "sell";    // selling to sell orders
    inputPriceMode = "buy";      // buying mats from buy orders
  }
  // -----------------------------------------------------

  let result = {};

  for (const tier of TIERS) {
    result[tier] = [];
    PI_ITEMS.filter(x => x.tier === tier).forEach(item => {
      const batchQty = item.quantity || 1;
      const sell = PRICES[item.id]?.sell || 0;
      const buy = PRICES[item.id]?.buy || 0;
      const unitPrice = PRICES[item.id]?.[outputPriceMode] || 0;
      const batchValue = unitPrice * batchQty;
      const tax = batchValue * (taxRate / 100);

      const ingredients = (item.recipe || []).map(r => {
        const ing = PI_MAP[r.id];
        return {
          id: r.id,
          name: ing?.name || "???",
          amt: r.amt,
        };
      });

      const p0costBatch = getP0CostBatch(item, inputPriceMode);
      const profitP0This = batchValue - p0costBatch - tax;
      const prevCostBatch = getLastStepCostBatch(item, inputPriceMode);
      const profitPrevThis = batchValue - prevCostBatch - tax;

      result[tier].push({
        tier,
        name: item.name,
        quantity: batchQty,
        lowestSeller: sell,
        highestBuyer: buy,
        valueOneUnit: unitPrice,
        valueBatch: batchValue,
        ingredients,
        profitP0This,
        profitPrevThis,
      });
    });

    result[tier].sort((a, b) => a.name.localeCompare(b.name));
  }

  res.json(result);
}

const express = require("express");
const router = express.Router();
router.post("/api/pi/calc", piCalcApi);
module.exports = router;
