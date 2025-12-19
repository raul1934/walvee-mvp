const { sequelize } = require("./sequelize");

async function checkTables() {
  try {
    const tables = await sequelize.query("SHOW TABLES LIKE 'place_reviews'", {
      type: sequelize.QueryTypes.SELECT,
    });
    console.log("place_reviews exists:", tables.length > 0);

    const tables2 = await sequelize.query("SHOW TABLES LIKE 'trip_reviews'", {
      type: sequelize.QueryTypes.SELECT,
    });
    console.log("trip_reviews exists:", tables2.length > 0);

    const tables3 = await sequelize.query("SHOW TABLES LIKE 'city_reviews'", {
      type: sequelize.QueryTypes.SELECT,
    });
    console.log("city_reviews exists:", tables3.length > 0);

    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

checkTables();
