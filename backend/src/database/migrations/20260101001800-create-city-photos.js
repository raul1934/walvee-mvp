'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('city_photos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      city_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'cities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      google_photo_reference: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Google Maps photo reference',
      },
      url: {
        type: Sequelize.STRING(1000),
        comment: 'Photo URL',
      },
      attribution: {
        type: Sequelize.TEXT,
        comment: 'Photo attribution/credit information',
      },
      photo_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Display order of photos for the city',
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
    await queryInterface.addIndex('city_photos', ['city_id'], {
      name: 'idx_city_photos_city_id',
    });
    await queryInterface.addIndex('city_photos', ['city_id', 'google_photo_reference'], {
      name: 'idx_city_photos_city_google_ref',
      unique: true,
    });
    await queryInterface.addIndex('city_photos', ['city_id', 'photo_order'], {
      name: 'idx_city_photos_city_order',
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('city_photos');
  }
};
