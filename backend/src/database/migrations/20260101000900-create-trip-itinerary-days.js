'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('trip_itinerary_days', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      trip_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'trips',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      city_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'cities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Links itinerary day to a specific city for multi-city trips',
      },
      day_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
      },
      description: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('trip_itinerary_days', ['trip_id'], {
      name: 'idx_trip_itinerary_days_trip_id',
    });
    await queryInterface.addIndex('trip_itinerary_days', ['day_number'], {
      name: 'idx_trip_itinerary_days_day_number',
    });
    await queryInterface.addIndex('trip_itinerary_days', ['trip_id', 'city_id'], {
      name: 'idx_trip_itinerary_days_trip_city',
    });
    await queryInterface.addIndex('trip_itinerary_days', ['trip_id', 'city_id', 'day_number'], {
      name: 'idx_trip_itinerary_days_unique',
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('trip_itinerary_days');
  }
};
