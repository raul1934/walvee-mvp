const { getConnection } = require("./connection");

/**
 * Migration to add city_photos table for Google Maps city images caching
 */
const addCityPhotosTable = async () => {
  const connection = await getConnection();

  try {
    console.log("Adding city_photos table if not exist...\n");

    // Check and create city_photos table
    const [photosRows] = await connection.query("SHOW TABLES LIKE 'city_photos'");

    if (photosRows.length === 0) {
      console.log("Creating city_photos table...");
      await connection.query(`
        CREATE TABLE city_photos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          city_id INT NOT NULL,
          google_photo_reference VARCHAR(500) NOT NULL,
          url_small VARCHAR(1000) COMMENT 'Photo URL with maxWidth: 400',
          url_medium VARCHAR(1000) COMMENT 'Photo URL with maxWidth: 800',
          url_large VARCHAR(1000) COMMENT 'Photo URL with maxWidth: 1600',
          width INT,
          height INT,
          attribution TEXT COMMENT 'Photo attribution/credit information',
          photo_order INT DEFAULT 0 COMMENT 'Display order of photos for the city',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
          INDEX idx_city_id (city_id),
          UNIQUE KEY unique_city_photo_reference (city_id, google_photo_reference)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log("✓ Created city_photos table\n");
    } else {
      console.log("✓ city_photos table already exists\n");
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
  addCityPhotosTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { addCityPhotosTable };
