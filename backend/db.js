// db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function ensureSchemaWithRetry(retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📦 Attempt ${attempt} to ensure DB schema...`);
      await ensureSchema();
      console.log('✅ Schema ensured');
      return;
    } catch (err) {
      console.error(`❌ Attempt ${attempt} failed:`, err.message);
      if (attempt === retries) {
        throw new Error('❌ All attempts to connect to DB failed.');
      }
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}

async function ensureSchema() {
  // Create market_prices if not exists
  await pool.query(`DROP TABLE IF EXISTS industry_job_costs CASCADE;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS market_prices (
      id SERIAL PRIMARY KEY,
      type_id INTEGER NOT NULL,
      station VARCHAR(64) NOT NULL,
      buy_price NUMERIC(16,2) NOT NULL,
      sell_price NUMERIC(16,2) NOT NULL,
      avg_price NUMERIC(16,2) NOT NULL,
      fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      UNIQUE (type_id, station)
    );
  `);

  // Create industry_job_costs if not exists
await pool.query(`
  CREATE TABLE industry_job_costs (
    solar_system_id INTEGER PRIMARY KEY,
    system_name TEXT,
    manufacturing NUMERIC,
    researching_time_efficiency NUMERIC,
    researching_material_efficiency NUMERIC,
    copying NUMERIC,
    invention NUMERIC,
    reaction NUMERIC,
    fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  );
`);


await pool.query(`
  CREATE TABLE IF NOT EXISTS wormhole_systems (
    jcode TEXT PRIMARY KEY,
    region TEXT,
    constellation TEXT,
    solarsystemid TEXT,
    class TEXT,
    effect TEXT,
    statics TEXT[],        -- ✅ Add this
    star_id BIGINT,        -- ✅ Add this
    star_name TEXT,
    star_type_id INTEGER
  );
`);


  await pool.query(`
    CREATE TABLE IF NOT EXISTS planets (
      planet_id BIGINT PRIMARY KEY,
      jcode TEXT REFERENCES wormhole_systems(jcode),
      name TEXT,
      type_id INTEGER,
      type_name TEXT,
      moon_count INTEGER
    );
  `);
}

module.exports = {
  pool,
  query: (...args) => pool.query(...args),
  ensureSchemaWithRetry,
};
