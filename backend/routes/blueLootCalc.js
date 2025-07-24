// backend route: POST /api/blue-loot-calc
// description: calculates total blue loot and per-player payouts based on ship composition and site runs

const express = require("express");
const router = express.Router();

const siteValues = {
  // C5 sites
  "Core Garrison": { base: 353_400_000, dreadBonus: 305_000_000 },
  "Core Stronghold": { base: 334_900_000, dreadBonus: 305_000_000 },
  "Oruze Osobnyk": { base: 264_700_000, dreadBonus: 305_000_000 },
  "Quarantine Area": { base: 246_900_000, dreadBonus: 305_000_000 },
  "Unsecured Frontier Enclave Relay": { base: 344_900_000, dreadBonus: 105_000_000 },
  "Unsecured Frontier Server Bank": { base: 272_100_000, dreadBonus: 105_000_000 },
  "Forgotten Core Data Field": { base: 279_000_000, dreadBonus: 105_000_000 },
  "Forgotten Core Information Pen": { base: 332_900_000, dreadBonus: 105_000_000 },

  // C6 sites
  "Core Bastion": { base: 545_600_000, dreadBonus: 340_000_000 },
  "Core Citadel": { base: 410_100_000, dreadBonus: 340_000_000 },
  "Strange Energy Readings": { base: 391_800_000, dreadBonus: 340_000_000 },
  "The Mirror": { base: 463_200_000, dreadBonus: 340_000_000 },
  "Unsecured Core Backup Array": { base: 688_300_000, dreadBonus: 140_000_000 },
  "Unsecured Core Emergence": { base: 627_100_000, dreadBonus: 140_000_000 },
  "Forgotten Core Assembly Hall": { base: 642_500_000, dreadBonus: 140_000_000 },
  "Forgotten Core Circuitry Disassembler": { base: 657_600_000, dreadBonus: 140_000_000 }
};

function calculateSiteISK(siteName, count, usedDread, drifterRan) {
  const site = siteValues[siteName];
  if (!site) return 0;

  let base = site.base + (usedDread ? site.dreadBonus : 0);

  // Apply Drifter penalty if toggle is OFF (drifterRan is false)
  const subtractSites = [
    "Core Garrison", "Core Stronghold", "Oruze Osobnyk", "Quarantine Area",
    "Core Bastion", "Core Citadel", "Strange Energy Readings", "The Mirror"
  ];

  if (!drifterRan && subtractSites.includes(siteName)) {
    base -= 100_000_000;
  }

  return count * base;
}


function calculatePlayerShares(player) {
  let shares = 0;

  for (let i = 0; i < player.marauders; i++) {
    shares += i === 0 ? 1.5 : i === 1 ? 1.0 : 0.5;
  }

  for (let i = 0; i < player.dread; i++) {
    shares += i === 0 ? 2.5 : 1.5;
  }

  if (player.bubbler) {
    shares += 0.5;
  }

  if (typeof player.extraShares === "number") {
    shares += player.extraShares;
  }

  return shares;
}


router.post("/api/blue-loot-calc", (req, res) => {
  const { siteRuns, players, accounting = 5, drifterRan = true } = req.body;
  console.log("🧾 Incoming request body:", req.body);
  if (!Array.isArray(siteRuns) || !Array.isArray(players)) {
    return res.status(400).json({ error: "Missing or invalid siteRuns or players array." });
  }

  // Calculate total ISK from sites
  let totalISK = 0;
  for (const { siteName, count, usedDread } of siteRuns) {
    totalISK += calculateSiteISK(siteName, count, usedDread, drifterRan);
  }


  // Calculate shares
  const playerShares = players.map((p, index) => ({
    name: p.name || `Player ${index + 1}`,
    shares: calculatePlayerShares(p)
  }));

  const totalShares = playerShares.reduce((sum, p) => sum + p.shares, 0);
  const payoutPerShare = totalISK / totalShares;

  const taxRate = 7.5 - (0.462 * accounting); // 11% decrease per level
  const taxMult = 1 - (taxRate / 100);
  
  // Final payouts
  const payouts = playerShares.map((p) => ({
    name: p.name,
    shares: p.shares,
    payout: Math.round(p.shares * payoutPerShare * taxMult)
  }));

  res.json({
    totalISK,
    totalShares,
    payoutPerShare: Math.round(payoutPerShare),
    taxRate: taxRate,
    payouts
  });
});

module.exports = router;
