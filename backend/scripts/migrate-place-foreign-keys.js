const { sequelize } = require('../src/database/sequelize');

(async () => {
  const transaction = await sequelize.transaction();

  try {
    console.log('Starting migration of place_id foreign keys to UUID...\n');

    // 1. Add temporary UUID columns
    console.log('Step 1: Adding temporary UUID columns...');

    await sequelize.query(
      'ALTER TABLE trip_places ADD COLUMN place_id_uuid CHAR(36) NULL',
      { transaction }
    );
    console.log('✓ Added trip_places.place_id_uuid');

    await sequelize.query(
      'ALTER TABLE trip_itinerary_activities ADD COLUMN place_id_uuid CHAR(36) NULL',
      { transaction }
    );
    console.log('✓ Added trip_itinerary_activities.place_id_uuid\n');

    // 2. Populate UUID columns based on existing integer references
    console.log('Step 2: Populating UUID columns...');

    await sequelize.query(
      `UPDATE trip_places tp
       JOIN places p ON tp.place_id = p.id
       SET tp.place_id_uuid = p.id
       WHERE tp.place_id IS NOT NULL`,
      { transaction }
    );
    const [tpResults] = await sequelize.query(
      'SELECT COUNT(*) as count FROM trip_places WHERE place_id_uuid IS NOT NULL',
      { transaction }
    );
    console.log(`✓ Updated ${tpResults[0].count} rows in trip_places`);

    await sequelize.query(
      `UPDATE trip_itinerary_activities tia
       JOIN places p ON tia.place_id = p.id
       SET tia.place_id_uuid = p.id
       WHERE tia.place_id IS NOT NULL`,
      { transaction }
    );
    const [tiaResults] = await sequelize.query(
      'SELECT COUNT(*) as count FROM trip_itinerary_activities WHERE place_id_uuid IS NOT NULL',
      { transaction }
    );
    console.log(`✓ Updated ${tiaResults[0].count} rows in trip_itinerary_activities\n`);

    // 3. Drop old place_id columns
    console.log('Step 3: Dropping old integer columns...');

    await sequelize.query(
      'ALTER TABLE trip_places DROP COLUMN place_id',
      { transaction }
    );
    console.log('✓ Dropped trip_places.place_id');

    await sequelize.query(
      'ALTER TABLE trip_itinerary_activities DROP COLUMN place_id',
      { transaction }
    );
    console.log('✓ Dropped trip_itinerary_activities.place_id\n');

    // 4. Rename UUID columns to place_id
    console.log('Step 4: Renaming UUID columns...');

    await sequelize.query(
      'ALTER TABLE trip_places CHANGE COLUMN place_id_uuid place_id CHAR(36) NULL',
      { transaction }
    );
    console.log('✓ Renamed trip_places.place_id_uuid -> place_id');

    await sequelize.query(
      'ALTER TABLE trip_itinerary_activities CHANGE COLUMN place_id_uuid place_id CHAR(36) NULL',
      { transaction }
    );
    console.log('✓ Renamed trip_itinerary_activities.place_id_uuid -> place_id\n');

    // 5. Add foreign key constraints
    console.log('Step 5: Adding foreign key constraints...');

    await sequelize.query(
      'ALTER TABLE trip_places ADD CONSTRAINT fk_trip_places_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE',
      { transaction }
    );
    console.log('✓ Added FK constraint on trip_places.place_id');

    await sequelize.query(
      'ALTER TABLE trip_itinerary_activities ADD CONSTRAINT fk_trip_itinerary_activities_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE',
      { transaction }
    );
    console.log('✓ Added FK constraint on trip_itinerary_activities.place_id\n');

    await transaction.commit();
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    process.exit();
  }
})();
