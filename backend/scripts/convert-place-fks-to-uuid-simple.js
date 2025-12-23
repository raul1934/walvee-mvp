const { sequelize } = require('../src/database/sequelize');

(async () => {
  const transaction = await sequelize.transaction();

  try {
    console.log('Converting place_id columns to UUID (existing data will be cleared)...\n');

    // 1. Convert trip_places.place_id to UUID
    console.log('Step 1: Converting trip_places.place_id...');

    await sequelize.query(
      'ALTER TABLE trip_places MODIFY COLUMN place_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL',
      { transaction }
    );
    console.log('✓ Converted trip_places.place_id to CHAR(36)');

    // Set all existing values to NULL since they reference old integer IDs
    await sequelize.query(
      'UPDATE trip_places SET place_id = NULL',
      { transaction }
    );
    console.log('✓ Cleared existing place_id values in trip_places\n');

    // 2. Convert trip_itinerary_activities.place_id to UUID
    console.log('Step 2: Converting trip_itinerary_activities.place_id...');

    await sequelize.query(
      'ALTER TABLE trip_itinerary_activities MODIFY COLUMN place_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL',
      { transaction }
    );
    console.log('✓ Converted trip_itinerary_activities.place_id to CHAR(36)');

    await sequelize.query(
      'UPDATE trip_itinerary_activities SET place_id = NULL',
      { transaction }
    );
    console.log('✓ Cleared existing place_id values in trip_itinerary_activities\n');

    // 3. Add foreign key constraints
    console.log('Step 3: Adding foreign key constraints...');

    try {
      await sequelize.query(
        'ALTER TABLE trip_places DROP FOREIGN KEY IF EXISTS fk_trip_places_place',
        { transaction }
      );
    } catch (e) {
      // Ignore if doesn't exist
    }

    await sequelize.query(
      'ALTER TABLE trip_places ADD CONSTRAINT fk_trip_places_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE',
      { transaction }
    );
    console.log('✓ Added FK constraint on trip_places.place_id');

    try {
      await sequelize.query(
        'ALTER TABLE trip_itinerary_activities DROP FOREIGN KEY IF EXISTS fk_trip_itinerary_activities_place',
        { transaction }
      );
    } catch (e) {
      // Ignore if doesn't exist
    }

    await sequelize.query(
      'ALTER TABLE trip_itinerary_activities ADD CONSTRAINT fk_trip_itinerary_activities_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE',
      { transaction }
    );
    console.log('✓ Added FK constraint on trip_itinerary_activities.place_id\n');

    await transaction.commit();
    console.log('✅ Migration completed successfully!');
    console.log('\n⚠️  NOTE: Existing place associations have been cleared due to incompatible data types.');
    console.log('You may need to re-associate places with trips and itinerary activities.');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    process.exit();
  }
})();
