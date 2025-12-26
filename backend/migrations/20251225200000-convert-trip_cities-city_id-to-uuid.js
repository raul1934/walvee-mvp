module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check current column type
      const [rows] = await queryInterface.sequelize.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'trip_cities'
          AND COLUMN_NAME = 'city_id'
      `);

      if (
        rows &&
        rows.length > 0 &&
        rows[0].COLUMN_TYPE &&
        rows[0].COLUMN_TYPE.toLowerCase().includes("int")
      ) {
        // Convert to CHAR(36) and allow NULL (cannot safely map old ints to UUIDs automatically)
        await queryInterface.sequelize.query(
          `ALTER TABLE trip_cities MODIFY COLUMN city_id CHAR(36) NULL`
        );
        console.log("  -> Converted trip_cities.city_id to CHAR(36) NULL");

        // Clear existing integer references since they cannot be mapped to UUIDs
        await queryInterface.sequelize.query(
          `UPDATE trip_cities SET city_id = NULL`
        );
        console.log(
          "  -> Cleared existing trip_cities.city_id values (manual remapping required if needed)"
        );
      } else if (
        rows &&
        rows.length > 0 &&
        rows[0].COLUMN_TYPE &&
        rows[0].COLUMN_TYPE.toLowerCase().includes("char(36)")
      ) {
        console.log(
          "  -> trip_cities.city_id already CHAR(36), skipping type change"
        );
      } else {
        console.log(
          "  -> trip_cities.city_id column missing or has unexpected type, proceeding to ensure FK"
        );
      }

      // Remove existing FK if present
      try {
        await queryInterface.sequelize.query(
          `ALTER TABLE trip_cities DROP FOREIGN KEY fk_trip_cities_city`
        );
      } catch (err) {
        // ignore if does not exist
      }

      // Add proper FK constraint to cities(id)
      try {
        await queryInterface.sequelize.query(
          `ALTER TABLE trip_cities ADD CONSTRAINT fk_trip_cities_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE ON UPDATE CASCADE`
        );
        console.log("  -> Added fk_trip_cities_city -> cities(id)");
      } catch (err) {
        console.log(
          "  -> Could not add fk_trip_cities_city (maybe exists or city_id contains invalid values) -",
          err.message
        );
      }

      // Ensure indexes exist
      try {
        await queryInterface.sequelize.query(
          `ALTER TABLE trip_cities ADD INDEX idx_city_id (city_id)`
        );
      } catch (err) {
        // ignore duplicates
      }
    } catch (err) {
      console.error(
        "Error converting trip_cities.city_id to UUID:",
        err.message
      );
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.warn(
      "Down migration not fully supported for convert-trip_cities-city_id-to-uuid. Manual rollback may be required."
    );
  },
};
