'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('trip_reviews', {
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
      created_by: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Email or identifier of the user who created the review',
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: 'Rating from 1-5 stars (can be integer or decimal for AI reviews)',
      },
      comment: {
        type: Sequelize.TEXT,
        comment: 'Review text (user comment or AI-generated text)',
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
    await queryInterface.addIndex('trip_reviews', ['trip_id'], {
      name: 'idx_trip_reviews_trip_id',
    });
    await queryInterface.addIndex('trip_reviews', ['reviewer_id'], {
      name: 'idx_trip_reviews_reviewer_id',
    });
    await queryInterface.addIndex('trip_reviews', ['created_by'], {
      name: 'idx_trip_reviews_created_by',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('trip_reviews');
  }
};
