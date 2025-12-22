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
      // Add CHAR(36) id column, backfill with UUIDs and set primary key
      await connection.query(
        `ALTER TABLE user_follow ADD COLUMN id CHAR(36) FIRST`
      );
      await connection.query(
        `UPDATE user_follow SET id = UUID() WHERE id IS NULL`
      );
      await connection.query(`ALTER TABLE user_follow ADD PRIMARY KEY (id)`);
      console.log("✓ Added `id` column to user_follow (CHAR(36) UUID)");
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
