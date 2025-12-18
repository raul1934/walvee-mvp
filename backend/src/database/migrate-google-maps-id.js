const { getConnection } = require("./connection");

/**
 * Migration to add google_maps_id column to countries and cities tables
 * This is needed because the tables were created before we added Google Maps integration
 */
const addGoogleMapsIdColumns = async () => {
  const connection = await getConnection();

  try {
    console.log("Adding google_maps_id columns to existing tables...\n");

    // Check if google_maps_id already exists in countries table
    const [countriesColumns] = await connection.query(
      "SHOW COLUMNS FROM countries LIKE 'google_maps_id'"
    );

    if (countriesColumns.length === 0) {
      console.log("Adding google_maps_id to countries table...");
      await connection.query(`
        ALTER TABLE countries
        ADD COLUMN google_maps_id VARCHAR(255) UNIQUE COMMENT 'Google Maps Place ID for the country'
        AFTER code
      `);

      await connection.query(`
        ALTER TABLE countries
        ADD INDEX idx_google_maps_id (google_maps_id)
      `);
      console.log("✓ Added google_maps_id to countries table\n");
    } else {
      console.log("✓ google_maps_id already exists in countries table\n");
    }

    // Check if google_maps_id already exists in cities table
    const [citiesColumns] = await connection.query(
      "SHOW COLUMNS FROM cities LIKE 'google_maps_id'"
    );

    if (citiesColumns.length === 0) {
      console.log("Adding google_maps_id to cities table...");
      await connection.query(`
        ALTER TABLE cities
        ADD COLUMN google_maps_id VARCHAR(255) UNIQUE COMMENT 'Google Maps Place ID for the city'
        AFTER country_id
      `);

      await connection.query(`
        ALTER TABLE cities
        ADD INDEX idx_google_maps_id (google_maps_id)
      `);
      console.log("✓ Added google_maps_id to cities table\n");
    } else {
      console.log("✓ google_maps_id already exists in cities table\n");
    }

    // Check if destination_city_id already exists in trips table
    const [tripsColumns] = await connection.query(
      "SHOW COLUMNS FROM trips LIKE 'destination_city_id'"
    );

    if (tripsColumns.length === 0) {
      console.log("Adding destination_city_id to trips table...");
      await connection.query(`
        ALTER TABLE trips
        ADD COLUMN destination_city_id INT COMMENT 'Foreign key to cities table'
        AFTER destination
      `);

      await connection.query(`
        ALTER TABLE trips
        ADD FOREIGN KEY (destination_city_id) REFERENCES cities(id) ON DELETE SET NULL
      `);

      await connection.query(`
        ALTER TABLE trips
        ADD INDEX idx_destination_city_id (destination_city_id)
      `);
      console.log("✓ Added destination_city_id to trips table\n");
    } else {
      console.log("✓ destination_city_id already exists in trips table\n");
    }

    // Check if city_id already exists in users table
    const [usersColumns] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'city_id'"
    );

    if (usersColumns.length === 0) {
      console.log("Adding city_id to users table...");
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN city_id INT COMMENT 'Foreign key to cities table'
        AFTER bio
      `);

      await connection.query(`
        ALTER TABLE users
        ADD FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
      `);

      await connection.query(`
        ALTER TABLE users
        ADD INDEX idx_city_id (city_id)
      `);
      console.log("✓ Added city_id to users table\n");
    } else {
      console.log("✓ city_id already exists in users table\n");
    }

    console.log("All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    connection.release();
  }
};

if (require.main === module) {
  addGoogleMapsIdColumns()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { addGoogleMapsIdColumns };
