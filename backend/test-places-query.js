const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

async function testPlacesQuery() {
  try {
    const [placeMappings] = await sequelize.query(`
      SELECT DISTINCT pp.place_id, SUBSTRING_INDEX(SUBSTRING_INDEX(pp.url_small, '/places/', -1), '/', 1) as old_dir
      FROM place_photos pp
      WHERE pp.url_small LIKE '/images/places/%'
      ORDER BY pp.place_id
    `);
    console.log("Places query successful, found:", placeMappings.length);
    console.log("First few:", placeMappings.slice(0, 3));
  } catch (error) {
    console.error("Places query failed:", error);
  }
  process.exit(0);
}

testPlacesQuery();
