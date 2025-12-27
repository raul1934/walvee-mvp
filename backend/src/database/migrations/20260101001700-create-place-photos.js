'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('place_photos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      place_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'places',
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
        comment: 'Display order of photos for the place',
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
    await queryInterface.addIndex('place_photos', ['place_id'], {
      name: 'idx_place_photos_place_id',
    });
    await queryInterface.addIndex('place_photos', ['place_id', 'google_photo_reference'], {
      name: 'idx_place_photos_place_google_ref',
      unique: true,
    });
    await queryInterface.addIndex('place_photos', ['place_id', 'photo_order'], {
      name: 'idx_place_photos_place_order',
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('place_photos');
  }
};
