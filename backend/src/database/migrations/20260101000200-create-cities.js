'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cities', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      country_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'countries',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      google_maps_id: {
        type: Sequelize.STRING(255),
        unique: true,
        comment: 'Google Maps Place ID for the city',
      },
      state: {
        type: Sequelize.STRING(100),
        comment: 'State/Province/Region',
      },
      latitude: {
        type: Sequelize.DOUBLE,
      },
      longitude: {
        type: Sequelize.DOUBLE,
      },
      timezone: {
        type: Sequelize.STRING(50),
      },
      population: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('cities', ['country_id'], {
      name: 'idx_cities_country_id',
    });
    await queryInterface.addIndex('cities', ['name'], {
      name: 'idx_cities_name',
    });
    await queryInterface.addIndex('cities', ['google_maps_id'], {
      name: 'idx_cities_google_maps_id',
    });
    await queryInterface.addIndex('cities', ['name', 'country_id'], {
      name: 'idx_cities_name_country_id',
      unique: true,
    });

    // Add foreign key for users.city_id now that cities table exists
    await queryInterface.addConstraint('users', {
      fields: ['city_id'],
      type: 'foreign key',
      name: 'fk_users_city_id',
      references: {
        table: 'cities',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('users', 'fk_users_city_id');
    await queryInterface.dropTable('cities');
  }
};
