// Backend route: POST /api/gas-calc

const express = require("express");
const axios = require("axios");
const router = express.Router();

const modules = {
  // Scoops
  "Gas Cloud Scoop I": { type: "Scoop", baseAmount: 10, cycle: 30, residueChance: 0, residueMultiplier: 0 },
  "Crop' Gas Cloud Scoop": { type: "Scoop", baseAmount: 20, cycle: 40, residueChance: 1.0, residueMultiplier: 2 },
  "Plow' Gas Cloud Scoop": { type: "Scoop", baseAmount: 20, cycle: 40, residueChance: 1.0, residueMultiplier: 4 },
  "Gas Cloud Scoop II": { type: "Scoop", baseAmount: 20, cycle: 40, residueChance: .34, residueMultiplier: 1 },
  "Syndicate Gas Cloud Scoop": { type: "Scoop", baseAmount: 20, cycle: 30, residueChance: 0, residueMultiplier: 0 },
  // Harvesters
  "Gas Cloud Harvester I": { type: "Harvester", baseAmount: 100, cycle: 200, residueChance: 0, residueMultiplier: 0 },
  "Gas Cloud Harvester II": { type: "Harvester", baseAmount: 200, cycle: 160, residueChance: .34, residueMultiplier: 1 },
  "ORE Gas Cloud Harvester": { type: "Harvester", baseAmount: 200, cycle: 160, residueChance: 0, residueMultiplier: 0 }
};

const shipProfiles = {
  "Unbonused Ship": { yieldBonus: 1.0, durationBonus: 1.0, skillBonuses: { Frigate: 0, Barge: 0, Exhumer: 0 } },
  Venture: { yieldBonus: 2.0, durationBonus: 1.0, skillBonuses: { Frigate: -0.05, Barge: 0, Exhumer: 0 } },
  Prospect: { yieldBonus: 2.0, durationBonus: 1.0, skillBonuses: { Frigate: -0.05, Barge: 0, Exhumer: 0 } },
  Covetor: { yieldBonus: 1.0, durationBonus: 0.7, skillBonuses: { Frigate: 0, Barge: -0.03, Exhumer: 0 } },
  Retriever: { yieldBonus: 1.0, durationBonus: 0.875, skillBonuses: { Frigate: 0, Barge: -0.02, Exhumer: 0 } },
  Procurer: { yieldBonus: 1.0, durationBonus: 1.0, skillBonuses: { Frigate: 0, Barge: -0.02, Exhumer: 0 } },
  Hulk: { yieldBonus: 1.0, durationBonus: 0.7, skillBonuses: { Frigate: 0, Barge: -0.03, Exhumer: -0.03 } },
  Skiff: { yieldBonus: 1.0, durationBonus: 1.0, skillBonuses: { Frigate: 0, Barge: 0, Exhumer: -0.03 } },
  Mackinaw: { yieldBonus: 1.0, durationBonus: 0.875, skillBonuses: { Frigate: 0, Barge: -0.03, Exhumer: -0.03 } }
};

const gasTypeIDs = {
  "Fullerite-C28": "30375",
  "Fullerite-C32": "30376",
  "Fullerite-C50": "30370",
  "Fullerite-C60": "30371",
  "Fullerite-C70": "30372",
  "Fullerite-C72": "30373",
  "Fullerite-C84": "30374",
  "Fullerite-C320": "30377",
  "Fullerite-C540": "30378"
};

const gasSites = [
  { site: "Barren", gases: [ { name: "Fullerite-C50", units_per_cloud: 12000, m3_per_unit: 1 }, { name: "Fullerite-C60", units_per_cloud: 6000, m3_per_unit: 1 } ] },
  { site: "Token", gases: [ { name: "Fullerite-C60", units_per_cloud: 12000, m3_per_unit: 1 }, { name: "Fullerite-C70", units_per_cloud: 6000, m3_per_unit: 1 } ] },
  { site: "Minor", gases: [ { name: "Fullerite-C70", units_per_cloud: 12000, m3_per_unit: 1 }, { name: "Fullerite-C72", units_per_cloud: 6000, m3_per_unit: 2 } ] },
  { site: "Ordinary", gases: [ { name: "Fullerite-C72", units_per_cloud: 12000, m3_per_unit: 2 }, { name: "Fullerite-C84", units_per_cloud: 6000, m3_per_unit: 2 } ] },
  { site: "Sizeable", gases: [ { name: "Fullerite-C84", units_per_cloud: 12000, m3_per_unit: 2 }, { name: "Fullerite-C50", units_per_cloud: 6000, m3_per_unit: 1 } ] },
  { site: "Bountiful", gases: [ { name: "Fullerite-C28", units_per_cloud: 20000, m3_per_unit: 2 }, { name: "Fullerite-C32", units_per_cloud: 4000, m3_per_unit: 5 } ] },
  { site: "Vast", gases: [ { name: "Fullerite-C32", units_per_cloud: 20000, m3_per_unit: 5 }, { name: "Fullerite-C28", units_per_cloud: 4000, m3_per_unit: 2 } ] },
  { site: "Vital", gases: [ { name: "Fullerite-C540", units_per_cloud: 24000, m3_per_unit: 10 }, { name: "Fullerite-C320", units_per_cloud: 2000, m3_per_unit: 5 } ] },
  { site: "Instrumental", gases: [ { name: "Fullerite-C320", units_per_cloud: 24000, m3_per_unit: 5 }, { name: "Fullerite-C540", units_per_cloud: 2000, m3_per_unit: 10 } ] }
];

function durationMultiplier(ship, skills, implant, boostShip, miningDirector, industrialCommand, boostImplant, boostModule, bastion) {
  const bonuses = shipProfiles[ship].skillBonuses;
  const base = shipProfiles[ship].durationBonus;

  // Core ship and implant bonuses
  const skillReduction =
    skills.Frigate * bonuses.Frigate +
    skills.Barge * bonuses.Barge +
    skills.Exhumer * bonuses.Exhumer;
  const implantReduction = 1 - implant;
  const baseReduction = (base + skillReduction) * implantReduction;

  // Boosting math
  if (boostShip === "None") return baseReduction;

  const baseBoost = 0.15;
  const shipBonus = boostShip === "Orca"
    ? 0.03 * industrialCommand
    : boostShip === "Porpoise"
      ? 0.02 * industrialCommand
      : 0; // Gnosis or anything else gets 0

  const skillBonus = 0.10 * miningDirector;
  const implantBonus = (boostImplant === "mindlink" || boostImplant === "ore") ? 0.25 : 0;
  const moduleBonus = boostModule === "T2" ? 0.25 : 0;
  const bastionBonus = bastion === "Yes" && boostShip !== "Gnosis" ? 0.075 : 0;

  const totalBoostMultiplier = 1 + shipBonus + skillBonus + implantBonus + moduleBonus + bastionBonus;
  const boostReduction = baseBoost * totalBoostMultiplier;

  // Final multiplier (applying boost reduction after other reductions)
  return baseReduction * (1 - boostReduction);
}

const cachedPrices = {};

async function refreshPrices() {
  const ids = Object.values(gasTypeIDs).join(",");
  const url = `https://market.fuzzwork.co.uk/aggregates/?region=10000002&types=${ids}`;

  try {
    const res = await axios.get(url);
    for (const [typeID, data] of Object.entries(res.data)) {
      cachedPrices[typeID] = parseFloat(data?.buy?.max) || 1000;
    }
    console.log("✅ Gas prices refreshed.");
  } catch (err) {
    console.error("❌ Failed to fetch gas prices:", err.message);
  }
}

refreshPrices();
setInterval(refreshPrices, 60 * 60 * 1000);

function getISKPerUnit(gasName) {
  const typeID = gasTypeIDs[gasName];
  if (!typeID) return 1000;
  return cachedPrices[typeID] || 1000;
}

router.post("/api/gas-calc", async (req, res) => {
  try {
    console.log('✅ Received POST to /api/gas-calc');
    console.log('🧾 Raw req.body:', req.body);

    const {
      ship, moduleType, moduleCount, skills, shipCount, implant,
      boostShip, miningDirector, industrialCommand,
      boostImplant, boostModule, bastion
    } = req.body;
    const boostInfo = `${boostShip}, ${miningDirector}, ${industrialCommand}, ${boostImplant}, ${boostModule}, ${bastion}`;

    const mod = modules[moduleType];
    const profile = shipProfiles[ship];
    const durMult = durationMultiplier(
        ship,
        skills,
        implant,
        boostShip,
        miningDirector,
        industrialCommand,
        boostImplant,
        boostModule,
        bastion
    );

    const adjustedCycleTime = mod.cycle * durMult;
    const adjustedYield = mod.baseAmount * profile.yieldBonus;

    const m3PerSecondPerModule = adjustedYield / adjustedCycleTime;
    const m3PerSecondPerShip = m3PerSecondPerModule * moduleCount;
    const totalM3PerHour = m3PerSecondPerShip * 3600 * shipCount;

    const results = [];

    const { residueChance = 0, residueMultiplier = 0 } = mod;
    const wasteFactor = residueChance * residueMultiplier;         // e.g. 0.34 * 1 = 0.34
    const depletionFactor = 1 + wasteFactor;                       // how fast the cloud disappears
    const recoverFrac = 1 / depletionFactor;                       // fraction of cloud you actually loot
    const wasteFrac = 1 - recoverFrac;                             // == wasteFactor / (1 + wasteFactor)

    for (const site of gasSites) {
      const siteName = site.site;

      for (const gas of site.gases) {
        const gasName = gas.name;
        const m3PerUnit = gas.m3_per_unit;
        const unitsPerCloud = gas.units_per_cloud;

        // ---- hourly income (residue does NOT increase what you gather per cycle) ----
        const unitsPerHour = totalM3PerHour / m3PerUnit;
        const price = await getISKPerUnit(gasName);
        const iskPerHour = unitsPerHour * price;

        // ---- cloud stats ----
        const m3PerCloud = unitsPerCloud * m3PerUnit;
        const totalUnits = unitsPerCloud;

        // ---- expected *gathered* vs *wasted* from full cloud ----
        const gatheredUnits = totalUnits * recoverFrac;
        const wastedUnits   = totalUnits * wasteFrac;
        const gatheredM3    = m3PerCloud * recoverFrac;
        const wastedM3      = m3PerCloud * wasteFrac;
        const iskPerCloud   = gatheredUnits * price;
        const iskLostResidue= wastedUnits * price;

        // ---- TTK (accounting for residue increasing cloud depletion) ----
        // base (non-waste) removal per cycle in units:
        const adjustedUnitsPerModule = adjustedYield / m3PerUnit;
        const baseUnitsPerCycle = moduleCount * shipCount * adjustedUnitsPerModule;
        const effectiveUnitsPerCycle = baseUnitsPerCycle * depletionFactor; // base + expected waste
        const cyclesNeeded = totalUnits / effectiveUnitsPerCycle;
        const totalSeconds = cyclesNeeded * adjustedCycleTime;
        const totalMinutes = Math.ceil(totalSeconds / 60);

        let ttkFormatted;
        if (totalMinutes >= 60) {
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          ttkFormatted = `${hours}h ${minutes}m`;
        } else {
          ttkFormatted = `${totalMinutes}m`;
        }

        results.push({
          site: siteName,
          gas: gasName,
          m3_per_unit: m3PerUnit,
          units_per_cloud: unitsPerCloud,
          m3_per_cloud: m3PerCloud,
          price,
          unitsPerHour,
          iskPerHour,
          minutesToHuff: ttkFormatted,    // backward compat
          totalIskPerCloud: unitsPerCloud * price, // legacy "raw" cloud value (no waste)
          m3PerCloud: gatheredM3,
          m3LostResidue: wastedM3,
          iskPerCloud,
          iskLostResidue,
          ttk: ttkFormatted,
        });
      }
    }

    const siteOrder = [
        "Barren",
        "Token",
        "Minor",
        "Ordinary",
        "Sizeable",
        "Bountiful",
        "Vast",
        "Vital",
        "Instrumental",
    ];

    results.sort((a, b) => {
        const siteComparison = siteOrder.indexOf(a.site) - siteOrder.indexOf(b.site);
        if (siteComparison !== 0) return siteComparison;
        return b.units_per_cloud - a.units_per_cloud; // descending by cloud size
    });

    results.forEach((r, i) => (r._rowIndex = i));
    res.json(results);
  } catch (err) {
    console.error("❌ Uncaught server error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


module.exports = router;
