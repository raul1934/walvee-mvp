const mysql = require("mysql2/promise");
const config = require("../config/config");

let pool;

const createPool = () => {
  if (!pool) {
    pool = mysql.createPool(config.database);
  }
  return pool;
};

const getConnection = async () => {
  const pool = createPool();
  return await pool.getConnection();
};

const query = async (sql, params = []) => {
  const pool = createPool();
  // Ensure params is always an array
  const safeParams = Array.isArray(params) ? params : [];
  const [rows] = await pool.execute(sql, safeParams);
  return rows;
};

const testConnection = async () => {
  try {
    const connection = await getConnection();
    console.log("✓ Database connected successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("✗ Database connection failed:", error.message);
    return false;
  }
};

module.exports = {
  createPool,
  getConnection,
  query,
  testConnection,
};
