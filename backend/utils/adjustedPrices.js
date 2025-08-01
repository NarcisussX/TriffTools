const fs = require("fs");
const path = require("path");

let adjustedPrices = {};

try {
  const filePath = path.join(__dirname, "../cache/adjusted_prices.json");
  if (fs.existsSync(filePath)) {
    adjustedPrices = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log("✅ Loaded adjusted prices into memory");
  } else {
    console.warn("⚠️ adjusted_prices.json not found at:", filePath);
  }
} catch (err) {
  console.error("❌ Failed to load adjusted_prices.json:", err);
}

module.exports = adjustedPrices;
