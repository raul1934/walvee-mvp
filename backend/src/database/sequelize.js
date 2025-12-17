const { Sequelize } = require("sequelize");
const config = require("../config/config");

// Initialize Sequelize
const sequelize = new Sequelize(
  config.database.database,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: "mysql",
    logging: config.env === "development" ? console.log : false,
    pool: {
      max: config.database.connectionLimit || 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connected successfully (Sequelize)");
    return true;
  } catch (error) {
    console.error("✗ Database connection failed:", error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };
