require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const STATIONS = {
  'Jita 4-4': 60003760,
  'Amarr VIII': 60008494,
  'Dodixie': 60011866,
  'Rens': 60004588
};

const MATERIALS_FILE = path.join(__dirname, "all_blueprint_material_typeids.txt");
const BATCH_SIZE = 200; // Adjust if needed

function getTrackedTypeIDsFromFile(filepath) {
  const data = fs.readFileSync(filepath, "utf-8");
  const lines = data.split("\n").filter(line => line.trim() !== "");
  // If the file is "typeid,name", grab just the typeid as integer:
  return lines.map(line => parseInt(line.split(",")[0], 10)).filter(Number.isInteger);
}

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function fetchFuzzworksPricesForStation(stationId, typeIds) {
  const url = `https://market.fuzzwork.co.uk/aggregates/?station=${stationId}&types=${typeIds.join(',')}`;
  const resp = await axios.get(url);
  return resp.data; // { typeId: { buy, sell, all }, ... }
}

async function pollAndStorePrices() {
  const now = new Date();
  const TRACKED_TYPE_IDS = getTrackedTypeIDsFromFile(MATERIALS_FILE);

  for (const [stationName, stationId] of Object.entries(STATIONS)) {
    const typeIdChunks = chunkArray(TRACKED_TYPE_IDS, BATCH_SIZE);
    for (const typeIdBatch of typeIdChunks) {
      try {
        const pricesByTypeId = await fetchFuzzworksPricesForStation(stationId, typeIdBatch);
        for (const typeId of typeIdBatch) {
          const priceData = pricesByTypeId[typeId];
          await db.query(
            `INSERT INTO market_prices (type_id, station, buy_price, sell_price, avg_price, fetched_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (type_id, station) DO UPDATE
             SET buy_price=EXCLUDED.buy_price,
                 sell_price=EXCLUDED.sell_price,
                 avg_price=EXCLUDED.avg_price,
                 fetched_at=EXCLUDED.fetched_at`,
            [
              typeId,
              stationName,
              priceData?.buy?.max || 0,
              priceData?.sell?.min || 0,
              priceData?.all?.avg || 0,
              now
            ]
          );
          // Optionally, only log sometimes to avoid spamming logs:
           if (typeIdBatch.indexOf(typeId) === 0) {
             console.log(`[${now.toISOString()}] Batch of ${typeIdBatch.length} prices saved for ${stationName}`);
           }
        }
      } catch (err) {
        console.error(`Error fetching/saving prices for station ${stationName}:`, err.message);
      }
    }
  }
  console.log(`[${now.toISOString()}] Poll cycle completed.`);
}

// Main entry point: ensure schema, poll immediately, then every 30 minutes
(async () => {
  await db.ensureSchema();
  await pollAndStorePrices();
  setInterval(pollAndStorePrices, 30 * 60 * 1000); // Every 30 minutes
})();
