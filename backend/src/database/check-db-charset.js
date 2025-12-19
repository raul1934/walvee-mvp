const { sequelize } = require("./sequelize");

async function checkDatabaseCharset() {
  try {
    const dbName = sequelize.config.database;

    const [result] = await sequelize.query(`
      SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
      FROM INFORMATION_SCHEMA.SCHEMATA 
      WHERE SCHEMA_NAME = '${dbName}'
    `);

    console.log(`Database '${dbName}' charset info:`);
    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

checkDatabaseCharset();
