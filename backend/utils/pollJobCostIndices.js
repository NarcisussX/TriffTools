// backend/utils/pollJobCostIndices.js
const axios = require('axios');
const db = require('../db');

// ESI rate limits are generous but let's be polite
const NAME_BATCH_SIZE = 900; // under 1000 limit

async function resolveSystemNames(systemIds) {
  const names = {};
  // chunk
  for (let i = 0; i < systemIds.length; i += NAME_BATCH_SIZE) {
    const chunk = systemIds.slice(i, i + NAME_BATCH_SIZE);
    try {
      const resp = await axios.post(
        'https://esi.evetech.net/latest/universe/names/',
        chunk,
        { headers: { 'Content-Type': 'application/json' } }
      );
      // Response: [{category:"solar_system", id:30000142, name:"Jita"}, ...]
      for (const obj of resp.data) {
        if (obj.category === 'solar_system') {
          names[obj.id] = obj.name;
        }
      }
    } catch (err) {
      console.error(`❌ Failed resolving names for chunk starting ${chunk[0]}: ${err.message}`);
    }
  }
  return names;
}

async function pollJobCostIndices() {
  const url = 'https://esi.evetech.net/latest/industry/systems/?datasource=tranquility';
  const now = new Date();
  try {
    const res = await axios.get(url);
    const systems = res.data; // [{solar_system_id, cost_indices:[...]}, ...]

    // Collect all system IDs
    const ids = systems.map(s => s.solar_system_id);

    // Resolve names
    const idToName = await resolveSystemNames(ids);

    // Prepare insert queries
    for (const sys of systems) {
      const id = sys.solar_system_id;
      const name = idToName[id] || null;

      // Turn cost_indices array into columns
      const costMap = {};
      for (const ci of sys.cost_indices) {
        costMap[ci.activity] = ci.cost_index;
      }

      await db.query(
        `
        INSERT INTO industry_job_costs (
          solar_system_id,
          system_name,
          manufacturing,
          researching_time_efficiency,
          researching_material_efficiency,
          copying,
          invention,
          reaction,
          fetched_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (solar_system_id) DO UPDATE
        SET system_name = EXCLUDED.system_name,
            manufacturing = EXCLUDED.manufacturing,
            researching_time_efficiency = EXCLUDED.researching_time_efficiency,
            researching_material_efficiency = EXCLUDED.researching_material_efficiency,
            copying = EXCLUDED.copying,
            invention = EXCLUDED.invention,
            reaction = EXCLUDED.reaction,
            fetched_at = EXCLUDED.fetched_at;
        `,
        [
          id,
          name,
          costMap.manufacturing ?? null,
          costMap.researching_time_efficiency ?? null,
          costMap.researching_material_efficiency ?? null,
          costMap.copying ?? null,
          costMap.invention ?? null,
          costMap.reaction ?? null,
          now
        ]
      );
    }

    console.log(`[${now.toISOString()}] ✅ Industry job cost indices refreshed (${systems.length} systems).`);
  } catch (err) {
    console.error(`❌ Failed to poll industry job cost indices: ${err.message}`);
  }
}

module.exports = pollJobCostIndices;
