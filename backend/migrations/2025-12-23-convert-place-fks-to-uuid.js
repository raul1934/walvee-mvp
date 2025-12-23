module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Convert place_id foreign keys in junction tables from INT to CHAR(36) UUID
    // Note: This clears existing place associations as the old integer IDs
    // cannot be mapped to the new UUID system

    console.log('Converting place_id columns to UUID...\n');

    // 1. Convert trip_places.place_id
    await queryInterface.changeColumn('trip_places', 'place_id', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      collate: 'utf8mb4_unicode_ci',
    });

    // Clear existing values (can't be mapped to UUIDs)
    await queryInterface.sequelize.query(
      'UPDATE trip_places SET place_id = NULL'
    );

    // 2. Convert trip_itinerary_activities.place_id
    await queryInterface.changeColumn('trip_itinerary_activities', 'place_id', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      collate: 'utf8mb4_unicode_ci',
    });

    // Clear existing values
    await queryInterface.sequelize.query(
      'UPDATE trip_itinerary_activities SET place_id = NULL'
    );

    // 3. Add foreign key constraints
    try {
      await queryInterface.removeConstraint(
        'trip_places',
        'fk_trip_places_place'
      );
    } catch (e) {
      // Ignore if doesn't exist
    }

    await queryInterface.addConstraint('trip_places', {
      fields: ['place_id'],
      type: 'foreign key',
      name: 'fk_trip_places_place',
      references: {
        table: 'places',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });

    try {
      await queryInterface.removeConstraint(
        'trip_itinerary_activities',
        'fk_trip_itinerary_activities_place'
      );
    } catch (e) {
      // Ignore if doesn't exist
    }

    await queryInterface.addConstraint('trip_itinerary_activities', {
      fields: ['place_id'],
      type: 'foreign key',
      name: 'fk_trip_itinerary_activities_place',
      references: {
        table: 'places',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });

    console.log('✓ Converted place_id columns to UUID');
  },

  down: async (queryInterface, Sequelize) => {
    // Reverting this is non-trivial
    console.warn(
      'Down migration not fully supported. Restore from backup to revert.'
    );
  },
};
