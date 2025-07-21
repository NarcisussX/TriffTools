const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../db'); // <-- Import your DB module!
const router = express.Router();
const BASE_PRICES = require('./data/basePrices.json');


const BLUEPRINTS_PATH = path.join(__dirname, 'data', 'blueprints.json');
const blueprints = JSON.parse(fs.readFileSync(BLUEPRINTS_PATH, 'utf-8'));

const STRUCTURE_BONUSES = require('./data/structure');

function calcMaterials(materials, runs, ME, structureBonus = 0) {
  if (typeof ME !== 'number') ME = 0;
  if (typeof runs !== 'number') runs = 1;
  return materials.map(mat => {
    const base = mat.quantity * runs;
    const totalME = ME + structureBonus;
    const reduced = Math.ceil(base * (1 - totalME / 100)); // CCP-style rounding
    return {
      ...mat,
      adjustedQuantity: reduced
    };
  });
}

router.get('/buildcost', async (req, res) => {
  const { blueprint, runs, me, station, structure, system } = req.query;
  const jobCostOverride = req.query.jobCostOverride ? parseFloat(req.query.jobCostOverride) : null;

  if (!blueprint) {
    return res.status(400).json({ error: 'blueprint (typeID) is required' });
  }

  const bp = blueprints[blueprint];
  if (!bp) {
    return res.status(404).json({ error: 'Blueprint not found.' });
  }

  const mats = bp.materials['1'];
  if (!mats) {
    return res.status(404).json({ error: 'No manufacture activity for this blueprint.' });
  }

  const runsNum = runs ? parseInt(runs, 10) : 1;
  const meNum = me ? parseInt(me, 10) : 0;
  const stationName = station || 'Jita 4-4';

  const product = bp.products?.['1']?.[0]; // Needed for job cost calc
  console.log("📦 Blueprint products:", bp.products);
  console.log("📦 Product object:", bp.products?.['1']?.[0]);
  console.log("📦 product.typeID:", bp.products?.['1']?.[0]?.typeID);
  console.log("📦 basePrice from BASE_PRICES:", BASE_PRICES[bp.products?.['1']?.[0]?.typeID]);
  const basePrice = product ? BASE_PRICES[product.typeID] || 0 : 0;

let jobCostIndex = 0;

if (jobCostOverride && !isNaN(jobCostOverride)) {
  jobCostIndex = jobCostOverride;
} else if (system) {
  let query, params;

  if (!isNaN(system)) {
    // If system is a number, assume it's solar_system_id
    query = `SELECT manufacturing FROM industry_job_costs WHERE solar_system_id = $1 LIMIT 1`;
    params = [Number(system)];
  } else {
    // If it's a name, search by system_name
    query = `SELECT manufacturing FROM industry_job_costs WHERE system_name = $1 LIMIT 1`;
    params = [system];
  }

  const { rows: jobCostRows } = await db.query(query, params);

  if (jobCostRows.length > 0) {
    jobCostIndex = parseFloat(jobCostRows[0].manufacturing);
  }
}


const jobCostRaw = basePrice * runsNum * jobCostIndex;

let structureBonus = 0;
let jcReduction = 0;

if (structure && STRUCTURE_BONUSES[structure]) {
  const structureData = STRUCTURE_BONUSES[structure];
  structureBonus = structureData.ME || 0;           // ME % (material efficiency)
  jcReduction = (structureData.JC || 0) / 100;       // JC % -> decimal for multiplication
}

const jobCost = {
  sell: jobCostRaw * (1 - jcReduction),
  buy:  jobCostRaw * (1 - jcReduction),
  avg:  jobCostRaw * (1 - jcReduction)
};
  const adjusted = calcMaterials(mats, runsNum, meNum, structureBonus);
  const typeIDs = adjusted.map(mat => mat.typeID);

  const { rows: priceRows } = await db.query(
    `SELECT type_id, sell_price, buy_price, avg_price FROM market_prices
     WHERE type_id = ANY($1) AND station = $2`,
    [typeIDs, stationName]
  );

  const prices = {};
  for (const row of priceRows) {
    prices[row.type_id] = {
      sell: Number(row.sell_price),
      buy: Number(row.buy_price),
      avg: Number(row.avg_price)
    };
  }

  let totalCostSell = 0, totalCostBuy = 0, totalCostAvg = 0;
  const matsWithPrices = adjusted.map(mat => {
    const p = prices[mat.typeID] || { sell: null, buy: null, avg: null };
    const costSell = p.sell !== null ? p.sell * mat.adjustedQuantity : null;
    const costBuy  = p.buy !== null  ? p.buy  * mat.adjustedQuantity : null;
    const costAvg  = p.avg !== null  ? p.avg  * mat.adjustedQuantity : null;
    if (costSell !== null) totalCostSell += costSell;
    if (costBuy !== null)  totalCostBuy  += costBuy;
    if (costAvg !== null)  totalCostAvg  += costAvg;
    return {
      ...mat,
      adjustedQuantity: mat.adjustedQuantity,
      price: p,
      costSell,
      costBuy,
      costAvg
    };
  });

  res.json({
    blueprintName: bp.blueprintName,
    blueprintID: blueprint,
    categoryName: bp.categoryName || null,
    groupName: bp.groupName || null,
    runs: runsNum,
    ME: meNum,
    structure: structure || null,
    structureBonus,
    station: stationName,
    system: system || null,
    jobCostIndex,
    jobCost,
    materials: matsWithPrices,
    totalCost: {
      sell: totalCostSell,
      buy: totalCostBuy,
      avg: totalCostAvg
    },
    products: bp.products['1']
  });
});


module.exports = router;
