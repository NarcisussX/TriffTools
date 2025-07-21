const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const SDE_PATH = path.join(__dirname, 'sqlite-latest.sqlite');
const OUT_PATH = path.join(__dirname, 'blueprints.json');

const db = new Database(SDE_PATH);

const blueprints = {};
const blueprintRows = db.prepare(`SELECT typeID FROM industryBlueprints`).all();

for (const bp of blueprintRows) {
  // Blueprint name
  const bpNameRow = db.prepare(`SELECT typeName FROM invTypes WHERE typeID = ?`).get(bp.typeID);
  const blueprintName = bpNameRow ? bpNameRow.typeName : null;

  // Category + Group lookup based on first product from manufacturing activity
  let categoryName = null;
  let groupName = null;
  const productForCategory = db.prepare(`
    SELECT it.groupID
    FROM industryActivityProducts p
    JOIN invTypes it ON p.productTypeID = it.typeID
    WHERE p.typeID = ? AND p.activityID = 1
    LIMIT 1
  `).get(bp.typeID);

  if (productForCategory) {
    const groupRow = db.prepare(`SELECT groupName, categoryID FROM invGroups WHERE groupID = ?`).get(productForCategory.groupID);
    if (groupRow) {
      groupName = groupRow.groupName;
      const catRow = db.prepare(`SELECT categoryName FROM invCategories WHERE categoryID = ?`).get(groupRow.categoryID);
      if (catRow) categoryName = catRow.categoryName;
    }
  }

  // Products
  const products = db.prepare(`
    SELECT productTypeID, quantity, activityID
    FROM industryActivityProducts
    WHERE typeID = ?
  `).all(bp.typeID);

  // Materials
  const materials = db.prepare(`
    SELECT activityID, materialTypeID, quantity
    FROM industryActivityMaterials
    WHERE typeID = ?
  `).all(bp.typeID);

  // Organize materials by activity
  const matByActivity = {};
  for (const mat of materials) {
    if (!matByActivity[mat.activityID]) matByActivity[mat.activityID] = [];
    const matNameRow = db.prepare(`SELECT typeName FROM invTypes WHERE typeID = ?`).get(mat.materialTypeID);
    matByActivity[mat.activityID].push({
      typeID: mat.materialTypeID,
      name: matNameRow ? matNameRow.typeName : null,
      quantity: mat.quantity,
    });
  }

  // Organize products by activity
  const prodByActivity = {};
  for (const prod of products) {
    if (!prodByActivity[prod.activityID]) prodByActivity[prod.activityID] = [];
    const prodNameRow = db.prepare(`SELECT typeName FROM invTypes WHERE typeID = ?`).get(prod.productTypeID);
    prodByActivity[prod.activityID].push({
      typeID: prod.productTypeID,
      name: prodNameRow ? prodNameRow.typeName : null,
      quantity: prod.quantity,
    });
  }

  blueprints[bp.typeID] = {
    blueprintName,
    categoryName,
    groupName,
    materials: matByActivity,
    products: prodByActivity,
  };
}

fs.writeFileSync(OUT_PATH, JSON.stringify(blueprints, null, 2));
console.log(`✅ Extracted ${Object.keys(blueprints).length} blueprints to ${OUT_PATH}`);
