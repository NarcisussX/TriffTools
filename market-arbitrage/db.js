// db.js

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function ensureSchema() {
  // Drop the table (with CASCADE, in case of dependencies)
  await pool.query(`DROP TABLE IF EXISTS market_prices CASCADE;`);
  // Drop the sequence used for SERIAL id (clean up leftover sequence)
  await pool.query(`DROP SEQUENCE IF EXISTS market_prices_id_seq CASCADE;`);
  
  // Recreate the table, with a unique constraint for upsert
  await pool.query(`
    CREATE TABLE market_prices (
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
}

module.exports = {
  pool,
  query: (...args) => pool.query(...args),
  ensureSchema,
};
