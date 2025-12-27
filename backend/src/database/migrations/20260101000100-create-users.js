'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      google_id: {
        type: Sequelize.STRING(255),
        unique: true,
      },
      full_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      preferred_name: {
        type: Sequelize.STRING(100),
      },
      photo_url: {
        type: Sequelize.TEXT,
      },
      bio: {
        type: Sequelize.TEXT,
      },
      city_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'FK to cities table - nullable, will be set after cities table exists',
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "User's date of birth (YYYY-MM-DD)",
      },
      gender: {
        type: Sequelize.ENUM(
          'male',
          'female',
          'non-binary',
          'other',
          'prefer-not-to-say'
        ),
        allowNull: true,
      },
      instagram_username: {
        type: Sequelize.STRING(50),
      },
      onboarding_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email',
    });
    await queryInterface.addIndex('users', ['google_id'], {
      name: 'idx_users_google_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
