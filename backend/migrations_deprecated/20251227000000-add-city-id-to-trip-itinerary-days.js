/**
 * Migration: Add city_id column to trip_itinerary_days table
 *
 * This migration adds a UUID city_id column to link itinerary days to specific cities,
 * allowing trips with multiple cities to have separate itineraries per city.
 * The migration includes:
 * 1. Adding the city_id column with foreign key constraint
 * 2. Backfilling city_id from trip_cities association (first city for each trip)
 * 3. Adding performance index on (trip_id, city_id)
 * 4. Updating unique constraint to (trip_id, city_id, day_number)
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('[Migration] Starting: add-city-id-to-trip-itinerary-days');

    // Step 1: Add city_id column (nullable initially for backfill)
    await queryInterface.addColumn('trip_itinerary_days', 'city_id', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Links itinerary day to a specific city for multi-city trips',
    });

    console.log('[Migration] Added city_id column to trip_itinerary_days');

    // Step 2: Backfill city_id from trip_cities (use first city for each trip)
    // For existing itinerary days without city_id, assign the first city from trip_cities
    const [results] = await queryInterface.sequelize.query(`
      UPDATE trip_itinerary_days tid
      SET city_id = (
        SELECT tc.city_id
        FROM trip_cities tc
        WHERE tc.trip_id = tid.trip_id
        ORDER BY tc.city_order ASC
        LIMIT 1
      )
      WHERE tid.city_id IS NULL;
    `);

    console.log(`[Migration] Backfilled city_id for ${results.affectedRows || 0} itinerary days`);

    // Step 3: Remove old unique constraint (trip_id, day_number)
    // Find the constraint name first
    const [constraints] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_NAME = 'trip_itinerary_days'
        AND CONSTRAINT_TYPE = 'UNIQUE'
        AND CONSTRAINT_SCHEMA = DATABASE();
    `);

    // Remove each unique constraint that includes trip_id and day_number
    for (const constraint of constraints) {
      const constraintName = constraint.CONSTRAINT_NAME;
      try {
        await queryInterface.removeConstraint('trip_itinerary_days', constraintName);
        console.log(`[Migration] Removed constraint: ${constraintName}`);
      } catch (error) {
        console.log(`[Migration] Could not remove constraint ${constraintName}: ${error.message}`);
      }
    }

    // Step 4: Add new unique constraint (trip_id, city_id, day_number)
    // This allows same day_number across different cities in the same trip
    await queryInterface.addConstraint('trip_itinerary_days', {
      fields: ['trip_id', 'city_id', 'day_number'],
      type: 'unique',
      name: 'unique_trip_city_day',
    });

    console.log('[Migration] Added unique constraint on (trip_id, city_id, day_number)');

    // Step 5: Add index for query performance
    // Common query pattern: filter itinerary days by trip_id and city_id
    await queryInterface.addIndex('trip_itinerary_days', ['trip_id', 'city_id'], {
      name: 'idx_trip_itinerary_days_trip_city',
    });

    console.log('[Migration] Added index idx_trip_itinerary_days_trip_city');
    console.log('[Migration] Migration completed successfully');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('[Migration] Starting rollback: add-city-id-to-trip-itinerary-days');

    // Remove index first
    await queryInterface.removeIndex('trip_itinerary_days', 'idx_trip_itinerary_days_trip_city');
    console.log('[Migration] Removed index idx_trip_itinerary_days_trip_city');

    // Remove unique constraint
    await queryInterface.removeConstraint('trip_itinerary_days', 'unique_trip_city_day');
    console.log('[Migration] Removed unique constraint unique_trip_city_day');

    // Re-add old unique constraint (trip_id, day_number)
    await queryInterface.addConstraint('trip_itinerary_days', {
      fields: ['trip_id', 'day_number'],
      type: 'unique',
      name: 'unique_trip_day',
    });

    console.log('[Migration] Re-added unique constraint on (trip_id, day_number)');

    // Remove column
    await queryInterface.removeColumn('trip_itinerary_days', 'city_id');
    console.log('[Migration] Removed city_id column from trip_itinerary_days');
    console.log('[Migration] Rollback completed successfully');
  },
};
