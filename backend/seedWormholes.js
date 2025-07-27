const fs = require('fs');
const path = require('path');
const { pool, ensureSchemaWithRetry } = require('./db');

async function seed() {
  await ensureSchemaWithRetry();

  const dataPath = path.join(__dirname, 'data/enriched_systems.json');
  const rawData = fs.readFileSync(dataPath);
  const systems = JSON.parse(rawData);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const jcode of Object.keys(systems)) {
      const system = systems[jcode];
      const celestials = system.celestials || {};

      const star = celestials.star || {};
      const planets = celestials.planets || [];

      // Insert system
await pool.query(
  `
  INSERT INTO wormhole_systems (
    jcode, region, constellation, solarsystemid, class, effect, statics, star_id, star_name, star_type_id
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  ON CONFLICT (jcode) DO NOTHING;
`,
  [
    jcode,
    system.region,
    system.constellation,
    system.solarsystemid,
    system.class,
    system.effect,
    system.statics || null,
    star.id || null,
    star.name || null,
    star.type_id || null,
  ]
);


      // Insert planets
for (const planet of planets) {
  await pool.query(
    `
    INSERT INTO planets (
      planet_id, jcode, name, type_id, type_name, moon_count
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (planet_id) DO NOTHING;
    `,
    [
      planet.id,
      jcode,
      planet.esi_name || null,
      planet.type_id || null,
      planet.type_name || null,
      planet.moons || 0,
    ]
  );
}

    }

    await client.query('COMMIT');
    console.log('✅ Seed complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
  } finally {
    client.release();
  }
}

module.exports = seed;
