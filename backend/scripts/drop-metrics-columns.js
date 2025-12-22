const { getConnection } = require("../src/database/connection");

async function dropMetricsColumns() {
  const connection = await getConnection();

  try {
    console.log("Dropping unused metrics columns from users table...");

    // Check if columns exist before dropping them
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME IN ('metrics_followers', 'metrics_following', 'metrics_trips', 'metrics_likes_received')
    `);

    if (columns.length === 0) {
      console.log(
        "✅ No metrics columns found - they may have already been removed"
      );
      return;
    }

    console.log(
      `Found ${columns.length} metrics columns to drop:`,
      columns.map((c) => c.COLUMN_NAME)
    );

    // Drop each column
    for (const column of columns) {
      try {
        await connection.query(
          `ALTER TABLE users DROP COLUMN ${column.COLUMN_NAME}`
        );
        console.log(`✅ Dropped column: ${column.COLUMN_NAME}`);
      } catch (error) {
        console.error(
          `❌ Failed to drop column ${column.COLUMN_NAME}:`,
          error.message
        );
      }
    }

    console.log("✅ Metrics columns removal completed");
  } catch (error) {
    console.error("❌ Error during metrics columns removal:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run if called directly
if (require.main === module) {
  dropMetricsColumns()
    .then(() => {
      console.log("Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

module.exports = { dropMetricsColumns };
