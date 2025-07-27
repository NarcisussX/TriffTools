const { pool } = require("./db");
const seed = require("./seedWormholes");

async function ensureTablesExist() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS wormhole_systems (
      id SERIAL PRIMARY KEY,
      jcode TEXT UNIQUE,
      region TEXT,
      constellation TEXT,
      solarsystemid TEXT,
      class TEXT,
      effect TEXT,
      statics TEXT[],
      star_id BIGINT,
      star_type_id INT,
      star_name TEXT
    );
  `);

await pool.query(`
  CREATE TABLE IF NOT EXISTS wormhole_planets (
    id SERIAL PRIMARY KEY,
    system_jcode TEXT REFERENCES wormhole_systems(jcode) ON DELETE CASCADE,
    planet_id BIGINT UNIQUE,
    esi_name TEXT,
    type_id INT,
    type_name TEXT,
    moons INT
  );
`);

}

async function seedIfEmpty() {
  console.log("📦 Attempting to ensure DB schema...");

  await ensureTablesExist();

  const res = await pool.query("SELECT COUNT(*) FROM wormhole_systems");
  const count = parseInt(res.rows[0].count);

  if (count === 0) {
    console.log("🌌 Seeding database from enriched_celestials.json...");
    await seed();
    console.log("✅ Seeding complete!");
  } else {
    console.log(`🛰️ Database already seeded (${count} entries). Skipping.`);
  }
}

(async () => {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      console.log(`📦 Attempt ${attempts + 1} to ensure DB schema...`);
      await seedIfEmpty();
      break;
    } catch (err) {
      attempts++;
      console.error(`❌ Attempt ${attempts} failed:`, err);
      if (attempts >= maxAttempts) {
        console.error("💥 Max retries reached. Exiting.");
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 3000)); // Wait before retrying
    }
  }

  // ✅ Cleanup
  await pool.end();
})();
