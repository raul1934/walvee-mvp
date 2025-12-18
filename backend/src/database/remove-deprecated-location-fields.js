const { getConnection } = require("./connection");

/**
 * Migration to remove deprecated city and country columns from users table
 * These have been replaced by the city_id foreign key
 */
const removeDeprecatedLocationFields = async () => {
  const connection = await getConnection();

  try {
    console.log("Removing deprecated location fields from users table...\n");

    // Check if city column exists in users table
    const [cityColumn] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'city'"
    );

    if (cityColumn.length > 0) {
      console.log("Dropping city column from users table...");
      await connection.query(`
        ALTER TABLE users
        DROP COLUMN city
      `);
      console.log("✓ Dropped city column from users table\n");
    } else {
      console.log("✓ city column already removed from users table\n");
    }

    // Check if country column exists in users table
    const [countryColumn] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'country'"
    );

    if (countryColumn.length > 0) {
      console.log("Dropping country column from users table...");
      await connection.query(`
        ALTER TABLE users
        DROP COLUMN country
      `);
      console.log("✓ Dropped country column from users table\n");
    } else {
      console.log("✓ country column already removed from users table\n");
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    connection.release();
  }
};

if (require.main === module) {
  removeDeprecatedLocationFields()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { removeDeprecatedLocationFields };
