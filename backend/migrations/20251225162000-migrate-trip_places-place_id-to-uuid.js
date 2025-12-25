"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const desc = await queryInterface.describeTable('trip_places');

      if (desc.place_id && desc.place_id.type && desc.place_id.type.toLowerCase().includes('int')) {
        // Change column to CHAR(36) to hold UUIDs
        await queryInterface.changeColumn('trip_places', 'place_id', {
          type: Sequelize.CHAR(36),
          allowNull: true,
        });
        console.log('✓ Changed trip_places.place_id to CHAR(36)');
      } else {
        console.log('-> trip_places.place_id is already non-integer or missing type change, skipping');
      }

      // Ensure foreign key exists: drop any fk on place_id and re-add to reference places(id) with ON DELETE SET NULL
      try {
        await queryInterface.removeConstraint('trip_places', 'fk_trip_places_place');
      } catch (err) {
        // ignore if not exists
      }

      try {
        await queryInterface.addConstraint('trip_places', {
          fields: ['place_id'],
          type: 'foreign key',
          name: 'fk_trip_places_place',
          references: { table: 'places', field: 'id' },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        });
        console.log('✓ Added foreign key fk_trip_places_place -> places(id)');
      } catch (err) {
        console.log('-> Could not add fk_trip_places_place (maybe exists):', err.message);
      }
    } catch (err) {
      console.error('Error migrating trip_places.place_id:', err);
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const desc = await queryInterface.describeTable('trip_places');

      // Revert to INTEGER if needed
      await queryInterface.changeColumn('trip_places', 'place_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
      console.log('✓ Reverted trip_places.place_id to INTEGER');

      // Remove fk constraint if present
      try {
        await queryInterface.removeConstraint('trip_places', 'fk_trip_places_place');
        console.log('✓ Removed fk_trip_places_place');
      } catch (err) {}
    } catch (err) {
      console.error('Error reverting trip_places.place_id migration:', err);
    }
  },
};