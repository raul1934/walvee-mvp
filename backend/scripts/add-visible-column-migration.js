const { getConnection } = require("../src/database/connection");

async function migrate() {
  const conn = await getConnection();

  try {
    console.log("Adding visible column to places table...");

    // Check if column already exists
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'places' 
        AND COLUMN_NAME = 'visible'
    `);

    if (columns.length === 0) {
      // Add the column
      await conn.query(`
        ALTER TABLE places 
        ADD COLUMN visible BOOLEAN DEFAULT TRUE NOT NULL 
        COMMENT 'Whether place should be visible in searches (false for cities saved as places)'
      `);
      console.log("✓ Column added");

      // Update existing records
      const [result] = await conn.query(`
        UPDATE places 
        SET visible = false 
        WHERE JSON_CONTAINS(types, '"locality"') 
          AND JSON_CONTAINS(types, '"political"')
      `);
      console.log(
        `✓ Updated ${result.affectedRows} places (set visible=false for cities)`
      );
    } else {
      console.log("✓ Column already exists");
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error.message);
    throw error;
  } finally {
    conn.release();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
