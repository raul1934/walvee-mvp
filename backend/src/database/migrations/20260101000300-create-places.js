'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('places', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      google_place_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Google Maps Place ID',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
      },
      city_id: {
        type: Sequelize.UUID,
        references: {
          model: 'cities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      latitude: {
        type: Sequelize.DOUBLE,
      },
      longitude: {
        type: Sequelize.DOUBLE,
      },
      rating: {
        type: Sequelize.DECIMAL(2, 1),
      },
      user_ratings_total: {
        type: Sequelize.INTEGER,
      },
      price_level: {
        type: Sequelize.INTEGER,
      },
      types: {
        type: Sequelize.JSON,
        comment: 'Array of place types from Google Maps',
      },
      phone_number: {
        type: Sequelize.STRING(50),
      },
      website: {
        type: Sequelize.STRING(500),
      },
      opening_hours: {
        type: Sequelize.JSON,
        comment: 'Opening hours information from Google Maps',
      },
      visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Whether place should be visible in searches (false for cities saved as places)',
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
    await queryInterface.addIndex('places', ['google_place_id'], {
      name: 'idx_places_google_place_id',
    });
    await queryInterface.addIndex('places', ['city_id'], {
      name: 'idx_places_city_id',
    });
    await queryInterface.addIndex('places', ['name'], {
      name: 'idx_places_name',
    });
    await queryInterface.addIndex('places', ['latitude', 'longitude'], {
      name: 'idx_places_lat_lng',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('places');
  }
};
