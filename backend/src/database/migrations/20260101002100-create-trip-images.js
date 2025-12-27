'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('trip_images', {
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
      place_photo_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'place_photos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      city_photo_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'city_photos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      is_cover: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      image_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.addIndex('trip_images', ['trip_id'], {
      name: 'idx_trip_images_trip_id',
    });
    await queryInterface.addIndex('trip_images', ['place_photo_id'], {
      name: 'idx_trip_images_place_photo_id',
    });
    await queryInterface.addIndex('trip_images', ['city_photo_id'], {
      name: 'idx_trip_images_city_photo_id',
    });
    await queryInterface.addIndex('trip_images', ['trip_id', 'is_cover'], {
      name: 'idx_trip_images_trip_cover',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('trip_images');
  }
};
