const { sequelize } = require("./sequelize");
const { DataTypes } = require("sequelize");

async function testTableCreation() {
  try {
    const queryInterface = sequelize.getQueryInterface();

    console.log("Creating test_review table...");
    await queryInterface.createTable("test_review", {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
      },
      reviewer_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    });

    console.log("✓ test_review table created successfully");

    // Show the create statement
    const [result] = await sequelize.query("SHOW CREATE TABLE test_review");
    console.log("\nTable CREATE statement:");
    console.log(result[0]["Create Table"]);

    // Drop the test table
    await queryInterface.dropTable("test_review");
    console.log("\n✓ test_review table dropped");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);

    // Try to cleanup
    try {
      await sequelize.getQueryInterface().dropTable("test_review");
    } catch (e) {}

    process.exit(1);
  }
}

testTableCreation();
