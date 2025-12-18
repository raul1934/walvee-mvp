const { getConnection } = require("./connection");

/**
 * Idempotent migration to drop legacy `follows` table if it exists
 */
const dropFollows = async () => {
  const connection = await getConnection();

  try {
    console.log("Checking for legacy `follows` table...");
    const [rows] = await connection.query("SHOW TABLES LIKE 'follows'");

    if (rows.length > 0) {
      console.log("Dropping legacy `follows` table...");
      await connection.query("DROP TABLE IF EXISTS follows");
      console.log("✓ Dropped `follows` table");
    } else {
      console.log("✓ No legacy `follows` table found");
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
  dropFollows()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { dropFollows };
