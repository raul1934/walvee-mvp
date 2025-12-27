'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('trip_places', {
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
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
      },
      rating: {
        type: Sequelize.DECIMAL(2, 1),
      },
      price_level: {
        type: Sequelize.INTEGER,
      },
      types: {
        type: Sequelize.JSON,
      },
      description: {
        type: Sequelize.TEXT,
      },
      display_order: {
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
    await queryInterface.addIndex('trip_places', ['trip_id'], {
      name: 'idx_trip_places_trip_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('trip_places');
  }
};
