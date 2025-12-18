const { getConnection } = require("./connection");

/**
 * Migration to add user_follow table and migrate existing follows data
 */
const addUserFollow = async () => {
  const connection = await getConnection();

  try {
    console.log("Adding user_follow table if not exists...\n");

    const [rows] = await connection.query("SHOW TABLES LIKE 'user_follow'");

    if (rows.length === 0) {
      console.log("Creating user_follow table...");
      await connection.query(`
        CREATE TABLE user_follow (
          followee_id CHAR(36) NOT NULL,
          follower_id CHAR(36) NOT NULL,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          FOREIGN KEY (followee_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE KEY ux_followee_follower (followee_id, follower_id),
          INDEX idx_followee_id (followee_id),
          INDEX idx_follower_id (follower_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Try to migrate existing follows data if available
      const [hasFollows] = await connection.query("SHOW TABLES LIKE 'follows'");
      if (hasFollows.length > 0) {
        console.log("Migrating data from follows to user_follow...");
        await connection.query(`
          INSERT IGNORE INTO user_follow (followee_id, follower_id, created_at, updated_at)
          SELECT followee_id, follower_id, created_at, created_at FROM follows;
        `);
      }

      console.log("✓ Created user_follow table and migrated data\n");
    } else {
      console.log("✓ user_follow table already exists\n");
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
  addUserFollow()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { addUserFollow };
