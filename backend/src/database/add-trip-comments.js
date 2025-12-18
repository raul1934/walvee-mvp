const { getConnection } = require("./connection");

/**
 * Migration to add trip_comments table
 */
const addTripComments = async () => {
  const connection = await getConnection();

  try {
    console.log("Adding trip_comments table if not exists...\n");

    const [rows] = await connection.query("SHOW TABLES LIKE 'trip_comments'");

    if (rows.length === 0) {
      console.log("Creating trip_comments table...");
      await connection.query(`
        CREATE TABLE trip_comments (
          id CHAR(36) PRIMARY KEY,
          trip_id CHAR(36) NOT NULL,
          user_id CHAR(36) NOT NULL,
          comment TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_trip_id (trip_id),
          INDEX idx_user_id (user_id),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log("✓ Created trip_comments table\n");
    } else {
      console.log("✓ trip_comments table already exists\n");
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
  addTripComments()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { addTripComments };
