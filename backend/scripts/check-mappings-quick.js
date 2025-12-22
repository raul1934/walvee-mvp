const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

async function checkMappings() {
  try {
    const [placeMappings] = await sequelize.query(`
      SELECT DISTINCT pp.place_id, SUBSTRING_INDEX(SUBSTRING_INDEX(pp.url_small, '/places/', -1), '/', 1) as old_dir
      FROM place_photos pp
      WHERE pp.url_small LIKE '/images/places/%'
      ORDER BY pp.place_id
    `);

    console.log(`Found ${placeMappings.length} place mappings`);
    if (placeMappings.length > 0) {
      console.log("First few mappings:");
      placeMappings
        .slice(0, 5)
        .forEach((m) => console.log(`  ${m.place_id} -> ${m.old_dir}`));
    }

    const [cityMappings] = await sequelize.query(`
      SELECT DISTINCT cp.city_id, SUBSTRING_INDEX(SUBSTRING_INDEX(cp.url_small, '/cities/', -1), '/', 1) as old_dir
      FROM city_photos cp
      WHERE cp.url_small LIKE '/images/cities/%'
      ORDER BY cp.city_id
    `);

    console.log(`\nFound ${cityMappings.length} city mappings`);
    if (cityMappings.length > 0) {
      console.log("First few mappings:");
      cityMappings
        .slice(0, 5)
        .forEach((m) => console.log(`  ${m.city_id} -> ${m.old_dir}`));
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

checkMappings();
