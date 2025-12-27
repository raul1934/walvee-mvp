'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('trips', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      duration: {
        type: Sequelize.STRING(50),
      },
      budget: {
        type: Sequelize.STRING(50),
      },
      transportation: {
        type: Sequelize.STRING(255),
      },
      accommodation: {
        type: Sequelize.STRING(255),
      },
      best_time_to_visit: {
        type: Sequelize.STRING(255),
      },
      difficulty_level: {
        type: Sequelize.STRING(50),
      },
      trip_type: {
        type: Sequelize.STRING(50),
      },
      author_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      destination_lat: {
        type: Sequelize.DOUBLE,
      },
      destination_lng: {
        type: Sequelize.DOUBLE,
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      views_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_draft: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
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
    await queryInterface.addIndex('trips', ['author_id'], {
      name: 'idx_trips_author_id',
    });
    await queryInterface.addIndex('trips', ['is_public'], {
      name: 'idx_trips_is_public',
    });
    await queryInterface.addIndex('trips', ['is_featured'], {
      name: 'idx_trips_is_featured',
    });
    await queryInterface.addIndex('trips', ['created_at'], {
      name: 'idx_trips_created_at',
    });
    await queryInterface.addIndex('trips', ['author_id', 'is_draft', 'updated_at'], {
      name: 'idx_trips_author_draft_updated',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('trips');
  }
};
