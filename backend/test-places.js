const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

async function checkPlaces() {
  try {
    const [results] = await sequelize.query(
      "SELECT COUNT(*) as count FROM place_photos"
    );
    console.log("Total place photos:", results[0].count);

    const [mappings] = await sequelize.query(`
      SELECT DISTINCT pp.place_id, SUBSTRING_INDEX(SUBSTRING_INDEX(pp.url_small, '/places/', -1), '/', 1) as old_dir
      FROM place_photos pp
      WHERE pp.url_small LIKE '/images/places/%'
      ORDER BY pp.place_id
      LIMIT 5
    `);
    console.log("Sample place mappings:", mappings);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sequelize.close();
  }
}

checkPlaces();
