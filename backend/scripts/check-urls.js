const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

async function checkURLs() {
  const [results] = await sequelize.query(`
    SELECT pp.place_id, pp.url_small, pp.photo_order
    FROM place_photos pp
    WHERE pp.place_id = 'c9414cc6-df48-11f0-8f84-00155d5d61a4'
    LIMIT 3
  `);

  console.log("Current database URLs:");
  results.forEach((row) => {
    console.log(`Place ID: ${row.place_id}`);
    console.log(`URL: ${row.url_small}`);
    console.log(`Photo Order: ${row.photo_order}`);
    console.log("---");
  });

  process.exit(0);
}

checkURLs().catch(console.error);
