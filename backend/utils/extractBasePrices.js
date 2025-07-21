const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../sde/sqlite-latest.sqlite');
const sqlite = new Database(dbPath);
const output = {};

// Grab ALL invTypes with basePrice (covers T1, T2, etc)
const rows = sqlite.prepare(`
  SELECT typeID, basePrice
  FROM invTypes
  WHERE basePrice IS NOT NULL
`).all();

for (const row of rows) {
  output[row.typeID] = Number(row.basePrice);
}

fs.writeFileSync(
  path.join(__dirname, '../routes/data/basePrices.json'),
  JSON.stringify(output, null, 2)
);

console.log(`✅ Extracted ${Object.keys(output).length} base prices.`);
