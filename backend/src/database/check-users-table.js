const { sequelize } = require("./sequelize");

async function checkUsersTable() {
  try {
    const columns = await sequelize.query(
      "SHOW FULL COLUMNS FROM users WHERE Field = 'id'",
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
    console.log("users.id column info:");
    console.log(JSON.stringify(columns, null, 2));

    const createTable = await sequelize.query("SHOW CREATE TABLE users", {
      type: sequelize.QueryTypes.SELECT,
    });
    console.log("\nusers table CREATE statement:");
    console.log(createTable[0]["Create Table"]);

    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

checkUsersTable();
