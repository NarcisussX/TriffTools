const express = require("express");
const router = express.Router();
const oreData = require("./data/ore_data.json");
const modules = require("./data/mining_modules.json");
const crystals = require("./data/mining_crystals.json");
const ships = require("./data/mining_ship_bonuses.json");
const axios = require("axios");

const LOW_SLOT_UPGRADES = {
  "Mining Laser Upgrade II": 0.09,
  "Elara Restrained Mining Laser Upgrade": 0.08,
  "'Aoede' Mining Laser Upgrade": 0.10,
  "'Carpo' Mining Laser Upgrade": 0.09,
  "Mining Laser Upgrade I": 0.05,
};

const IMPLANT_BONUSES = {
  "None": 0,
  "Inherent Implants 'Highwall' Mining MX-1001": 0.01,
  "Inherent Implants 'Highwall' Mining MX-1003": 0.03,
  "Inherent Implants 'Highwall' Mining MX-1005": 0.05
};

function miningDurationMultiplier(
  baseMult, // should be 1, or base cycleTime if you want to return the final number directly
  boostShip,
  miningDirector,
  industrialCommand,
  boostImplant,
  boostModule,
  bastion
) {
  if (boostShip === "None") return baseMult;
  const baseBoost = 0.15; // for Porpoise
  const shipBonus =
    boostShip === "Orca"
      ? 0.03 * industrialCommand
      : boostShip === "Porpoise"
      ? 0.02 * industrialCommand
      : 0;
  const skillBonus = 0.10 * miningDirector;
  const implantBonus = (boostImplant === "mindlink" || boostImplant === "ore") ? 0.25 : 0;
  const moduleBonus = boostModule === "T2" ? 0.25 : 0;
  const bastionBonus = bastion === "Yes" && boostShip !== "Gnosis" ? 0.075 : 0;

  // Multiply all together to get burstStrength
  const burstStrength =
    (1 + shipBonus) *
    (1 + skillBonus) *
    (1 + implantBonus) *
    (1 + moduleBonus) *
    (1 + bastionBonus);

  const boostReduction = baseBoost * burstStrength;
  const multiplier = 1 - boostReduction;

  return baseMult * multiplier;
}

function getShipBonuses(ship, shipSkills) {
  const data = ships[ship];
  if (!data) return { cycleMult: 1, yieldMult: 1 };
  const type = data.type;
  let cycleMult = 1;
  let yieldMult = 1;

  const miningSkill = shipSkills.mining || 0;
  const astroSkill = shipSkills.astrogeology || 0;
  const bargeSkill = shipSkills.barge || 0;
  const exhumerSkill = shipSkills.exhumer || 0;
  const frigateSkill = shipSkills.frigate || 0;
  const expeditionSkill = shipSkills.expedition || 0;

  if (type === "barge") {
    cycleMult =
      (1 - parseFloat(data.shipBonusCycleTime)) *
      (1 - parseFloat(data.skillBargeCycleTime) * bargeSkill);

    yieldMult =
      (1 + parseFloat(data.skillBargeYield) * bargeSkill) *
      (1 + 0.05 * miningSkill) *
      (1 + 0.05 * astroSkill);
  } else if (type === "exhumer") {
    cycleMult =
      (1 - parseFloat(data.shipBonusCycleTime)) *
      (1 - parseFloat(data.skillExhumerCycleTime) * exhumerSkill) *
      (1 - parseFloat(data.skillBargeCycleTime) * bargeSkill);

    yieldMult =
      (1 + parseFloat(data.skillExhumerYield) * exhumerSkill) *
      (1 + parseFloat(data.skillBargeYield) * bargeSkill) *
      (1 + 0.05 * miningSkill) *
      (1 + 0.05 * astroSkill);
  } else if (type === "frigate") {
    cycleMult =
      1 - parseFloat(data.skillFrigateCycleTime) * frigateSkill;

    yieldMult =
      (1 + parseFloat(data.shipBonusYield)) *
      (1 + parseFloat(data.skillFrigateYield) * frigateSkill) *
      (1 + parseFloat(data.skillExpeditionYield) * expeditionSkill) *
      (1 + 0.05 * miningSkill) *
      (1 + 0.05 * astroSkill);
  }

  return { cycleMult, yieldMult };
}


router.post("/ore-calc", async (req, res) => {
  try {
    const { config, boost, implantName = "None", } = req.body; 
    const priceRes = await axios.get("http://localhost:3000/api/ore-prices");
    const priceData = priceRes.data;
    const result = {};
    const implantMult = 1 + (IMPLANT_BONUSES[implantName] || 0);

    const { ship, module, numModules, crystal, numShips, lowSlotName, lowSlotCount, skills } = config;
    const mod = modules[module];
    if (!mod) return res.json({ error: "No module selected" });
    const crystalBonus = crystals[crystal] || { durationMult: 1, yieldMult: 1 };
    const bonuses = getShipBonuses(ship, skills || {});
    let cycleTime = mod.cycle * (crystalBonus.durationMult || 1) * bonuses.cycleMult;
    cycleTime = miningDurationMultiplier(
      cycleTime,
      boost?.ship || "None",
      boost?.director || 0,
      boost?.industrial || 0,
      boost?.implant || "None",
      boost?.module || "T1",
      boost?.bastion || "No"
    );
    if (cycleTime > 1000) cycleTime = cycleTime / 1000;
    let lowSlotBonus = 0;

let lowSlotMult = 1;
if (lowSlotName && lowSlotCount) {
  const bonus = LOW_SLOT_UPGRADES[lowSlotName] || 0;
  lowSlotMult = Math.pow(1 + bonus, lowSlotCount);
}
const yieldPerCycle =
  mod.baseYield
  * (crystalBonus.yieldMult || 1)
  * bonuses.yieldMult
  * lowSlotMult
  * implantMult;



    // m³/sec for the full ship config
    const m3PerSecondPerModule = yieldPerCycle / cycleTime;
    const m3PerSecond = m3PerSecondPerModule * numModules * numShips;
    const m3PerHour = m3PerSecond * 3600;
    const cycleReductionPct = cycleTime * 100; // e.g. 41.6
    for (const [ore, oreInfo] of Object.entries(oreData)) {
      const price = priceData[ore] || 0; // ISK per unit (from fuzzworks)
      const unitsPerHour = oreInfo.m3 > 0 ? m3PerHour / oreInfo.m3 : 0;
      const iskPerHour = price * unitsPerHour;
      result[ore] = {
        iskPerUnit: price,
        unitsPerHour: Math.round(unitsPerHour),
        iskPerHour: Math.round(iskPerHour),
      };
    }
    res.json({
      result,
      cycleTime,
      yieldPerCycle,
      cycleTimeReduction: cycleReductionPct,
    });
  } catch (err) {
    console.error("Ore calc error:", err);
    res.status(500).json({ error: "Calculation failed" });
  }
});

// Price endpoint (using buy orders)
// At the top of your file (e.g., oreCalc.js)
let orePriceCache = null;
let orePriceCacheTimestamp = 0;

// Helper to fetch from fuzzworks
async function fetchOrePrices() {
  const ids = Object.values(oreData).map(o => o.id).join(',');
  const url = `https://market.fuzzwork.co.uk/aggregates/?region=10000002&types=${ids}`;
  const response = await axios.get(url);

  const prices = {};
  for (const oreName in oreData) {
    const id = oreData[oreName].id;
    const buy = response.data[id]?.buy?.max ?? null;
    prices[oreName] = buy;
  }
  return prices;
}

// Main GET endpoint with hourly caching
router.get("/ore-prices", async (req, res) => {
  try {
    const now = Date.now();
    // 1 hour = 3600000 ms
    if (!orePriceCache || now - orePriceCacheTimestamp > 3600000) {
      orePriceCache = await fetchOrePrices();
      orePriceCacheTimestamp = now;
      console.log("Ore prices cache updated");
    }
    res.json(orePriceCache);
  } catch (err) {
    console.error('Error fetching ore prices:', err.message);
    res.status(500).json({ error: 'Failed to fetch ore prices' });
  }
});


module.exports = router;
