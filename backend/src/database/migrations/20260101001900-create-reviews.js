'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      trip_id: {
        type: Sequelize.UUID,
        references: {
          model: 'trips',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      place_id: {
        type: Sequelize.STRING(255),
      },
      reviewer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
      },
      ai_rating: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'AI-generated rating (1-5 stars)',
      },
      ai_text: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'AI-generated review text',
      },
      is_ai_generated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Flag to indicate if this review is AI-generated',
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
    await queryInterface.addIndex('reviews', ['trip_id'], {
      name: 'idx_reviews_trip_id',
    });
    await queryInterface.addIndex('reviews', ['place_id'], {
      name: 'idx_reviews_place_id',
    });
    await queryInterface.addIndex('reviews', ['reviewer_id'], {
      name: 'idx_reviews_reviewer_id',
    });
    await queryInterface.addIndex('reviews', ['place_id', 'is_ai_generated'], {
      name: 'idx_reviews_place_ai',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('reviews');
  }
};
