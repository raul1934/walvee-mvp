module.exports = {
  id: "20251223000000-drop-trips-destination-columns",
  async up(db) {
    // If destination_city_id exists, drop FK/index then column
    const [hasDestCity] = await db.query(
      "SHOW COLUMNS FROM trips LIKE 'destination_city_id'"
    );
    if (hasDestCity.length > 0) {
      try {
        await db.query(
          "ALTER TABLE trips DROP FOREIGN KEY IF EXISTS fk_trips_destination_city_id"
        );
      } catch (e) {
        // ignore if constraint not present
      }
      try {
        await db.query(
          "ALTER TABLE trips DROP INDEX IF EXISTS idx_destination_city_id"
        );
      } catch (e) {
        // ignore
      }
      await db.query("ALTER TABLE trips DROP COLUMN destination_city_id");
      console.log("✓ Dropped destination_city_id from trips");
    }

    // Drop legacy destination column if exists
    const [hasDest] = await db.query(
      "SHOW COLUMNS FROM trips LIKE 'destination'"
    );
    if (hasDest.length > 0) {
      await db.query("ALTER TABLE trips DROP COLUMN destination");
      console.log("✓ Dropped destination column from trips");
    }
  },

  async down(db) {
    // Recreate destination and destination_city_id columns for rollback convenience
    await db.query(
      "ALTER TABLE trips ADD COLUMN destination VARCHAR(255) NULL"
    );
    await db.query(
      "ALTER TABLE trips ADD COLUMN destination_city_id INT NULL, ADD INDEX idx_destination_city_id (destination_city_id)"
    );
    await db.query(
      "ALTER TABLE trips ADD CONSTRAINT fk_trips_destination_city_id FOREIGN KEY (destination_city_id) REFERENCES cities(id) ON DELETE SET NULL"
    );
    console.log(
      "✓ Restored destination and destination_city_id columns on rollback"
    );
  },
};
