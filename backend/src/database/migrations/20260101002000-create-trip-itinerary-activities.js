'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('trip_itinerary_activities', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      itinerary_day_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'trip_itinerary_days',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      time: {
        type: Sequelize.STRING(20),
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING(255),
      },
      description: {
        type: Sequelize.TEXT,
      },
      activity_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      place_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'places',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Link to cached Google Maps place data',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex('trip_itinerary_activities', ['itinerary_day_id'], {
      name: 'idx_trip_itinerary_activities_day_id',
    });
    await queryInterface.addIndex('trip_itinerary_activities', ['activity_order'], {
      name: 'idx_trip_itinerary_activities_order',
    });
    await queryInterface.addIndex('trip_itinerary_activities', ['place_id'], {
      name: 'idx_trip_itinerary_activities_place_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('trip_itinerary_activities');
  }
};
