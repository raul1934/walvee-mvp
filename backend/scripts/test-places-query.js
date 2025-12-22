const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

async function testPlacesQuery() {
  try {
    const [placeMappings] = await sequelize.query(`
      SELECT pp.url_small, pp.place_id, p.city_id, pp.id
      FROM place_photos pp
      JOIN places p ON pp.place_id = p.id
      WHERE pp.url_small LIKE '/images/places/%'
      ORDER BY pp.place_id
      LIMIT 5
    `);
    console.log("Sample place photo URLs:");
    placeMappings.forEach((row) => {
      console.log(row.url_small);
    });
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

testPlacesQuery();
