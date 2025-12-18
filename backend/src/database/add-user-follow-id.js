const { getConnection } = require("./connection");

/**
 * Add an `id` primary key to user_follow if missing (idempotent)
 */
const addIdToUserFollow = async () => {
  const connection = await getConnection();

  try {
    console.log("Checking for existing `id` column on user_follow...");

    const [cols] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_follow' AND COLUMN_NAME = 'id'
    `);

    if (cols.length === 0) {
      console.log("Adding `id` column to user_follow...");
      await connection.query(
        `ALTER TABLE user_follow ADD COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;`
      );
      console.log("✓ Added `id` column to user_follow");
    } else {
      console.log("✓ `id` column already exists on user_follow");
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
  addIdToUserFollow()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { addIdToUserFollow };
