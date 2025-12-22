const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

async function checkMappings() {
  const [placeMappings] = await sequelize.query(`
    SELECT DISTINCT pp.place_id, SUBSTRING_INDEX(SUBSTRING_INDEX(pp.url_small, '/places/', -1), '/', 1) as old_dir
    FROM place_photos pp
    WHERE pp.url_small LIKE '/images/places/%'
    ORDER BY pp.place_id
    LIMIT 5
  `);

  console.log("Place mappings:", placeMappings);

  const [cityMappings] = await sequelize.query(`
    SELECT DISTINCT cp.city_id, SUBSTRING_INDEX(SUBSTRING_INDEX(cp.url_small, '/cities/', -1), '/', 1) as old_dir
    FROM city_photos cp
    WHERE cp.url_small LIKE '/images/cities/%'
    ORDER BY cp.city_id
    LIMIT 5
  `);

  console.log("City mappings:", cityMappings);

  await sequelize.close();
}

checkMappings();
