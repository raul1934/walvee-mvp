const { getConnection } = require("./connection");

/**
 * Migration to add places and place_photos tables for Google Maps caching
 */
const addPlacesTables = async () => {
  const connection = await getConnection();

  try {
    console.log("Adding places and place_photos tables if not exist...\n");

    // Check and create places table
    const [placesRows] = await connection.query("SHOW TABLES LIKE 'places'");

    if (placesRows.length === 0) {
      console.log("Creating places table...");
      await connection.query(`
        CREATE TABLE places (
          id CHAR(36) PRIMARY KEY,
          google_place_id VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          address TEXT,
          city_id INT,
          latitude DOUBLE,
          longitude DOUBLE,
          rating DECIMAL(2,1),
          user_ratings_total INT,
          price_level INT,
          types JSON,
          phone_number VARCHAR(50),
          website VARCHAR(500),
          opening_hours JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
          INDEX idx_google_place_id (google_place_id),
          INDEX idx_city_id (city_id),
          INDEX idx_name (name),
          INDEX idx_coordinates (latitude, longitude)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log("✓ Created places table\n");
    } else {
      console.log("✓ places table already exists\n");
    }

    // Check and create place_photos table
    const [photosRows] = await connection.query(
      "SHOW TABLES LIKE 'place_photos'"
    );

    if (photosRows.length === 0) {
      console.log("Creating place_photos table...");
      await connection.query(`
        CREATE TABLE place_photos (
          id CHAR(36) PRIMARY KEY,
          place_id CHAR(36) NOT NULL,
          google_photo_reference VARCHAR(500) NOT NULL,
          url_small VARCHAR(1000),
          url_medium VARCHAR(1000),
          url_large VARCHAR(1000),
          width INT,
          height INT,
          attribution TEXT,
          photo_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
          INDEX idx_place_id (place_id),
          UNIQUE KEY unique_photo_reference (place_id, google_photo_reference)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log("✓ Created place_photos table\n");
    } else {
      console.log("✓ place_photos table already exists\n");
    }

    // Check and add place_id to trip_places table
    const [tripPlacesColumns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'trip_places'
        AND COLUMN_NAME = 'place_id'
    `);

    if (tripPlacesColumns.length === 0) {
      console.log("Adding place_id column to trip_places table...");
      await connection.query(`
        ALTER TABLE trip_places
        ADD COLUMN place_id CHAR(36),
        ADD FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL,
        ADD INDEX idx_place_id (place_id);
      `);
      console.log("✓ Added place_id column to trip_places table\n");
    } else {
      console.log("✓ place_id column already exists in trip_places table\n");
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
  addPlacesTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { addPlacesTables };
