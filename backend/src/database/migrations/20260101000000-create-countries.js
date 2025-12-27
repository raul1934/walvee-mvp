'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('countries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      code: {
        type: Sequelize.STRING(2),
        allowNull: false,
        unique: true,
        comment: 'ISO 3166-1 alpha-2 country code',
      },
      google_maps_id: {
        type: Sequelize.STRING(255),
        unique: true,
        comment: 'Google Maps Place ID for the country',
      },
      continent: {
        type: Sequelize.STRING(50),
      },
      flag_emoji: {
        type: Sequelize.STRING(10),
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
    await queryInterface.addIndex('countries', ['code'], {
      name: 'idx_countries_code',
    });
    await queryInterface.addIndex('countries', ['name'], {
      name: 'idx_countries_name',
    });
    await queryInterface.addIndex('countries', ['google_maps_id'], {
      name: 'idx_countries_google_maps_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('countries');
  }
};
