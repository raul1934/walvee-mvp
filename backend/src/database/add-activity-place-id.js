const { sequelize } = require("./sequelize");
const { QueryTypes } = require("sequelize");

async function addActivityPlaceId() {
  try {
    console.log("Starting migration: add place_id to trip_itinerary_activities...");

    // Check if column already exists
    const [columns] = await sequelize.query(
      `SHOW COLUMNS FROM trip_itinerary_activities LIKE 'place_id'`,
      { type: QueryTypes.SELECT }
    );

    if (columns) {
      console.log("Column place_id already exists. Skipping migration.");
      return;
    }

    // Add place_id column
    await sequelize.query(`
      ALTER TABLE trip_itinerary_activities
      ADD COLUMN place_id INT NULL
      COMMENT 'Link to cached Google Maps place data'
      AFTER activity_order
    `);

    console.log("Added place_id column");

    // Add foreign key constraint
    await sequelize.query(`
      ALTER TABLE trip_itinerary_activities
      ADD CONSTRAINT fk_activity_place
      FOREIGN KEY (place_id) REFERENCES places(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);

    console.log("Added foreign key constraint");

    // Add index on place_id
    await sequelize.query(`
      CREATE INDEX idx_activity_place_id ON trip_itinerary_activities(place_id)
    `);

    console.log("Added index on place_id");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addActivityPlaceId()
    .then(() => {
      console.log("Migration script finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

module.exports = addActivityPlaceId;
