'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const userId = uuidv4();

    await queryInterface.bulkInsert('users', [{
      id: userId,
      email: 'walvee@walvee.com',
      full_name: 'Walvee',
      preferred_name: 'Walvee',
      photo_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png',
      bio: 'Your AI-powered travel companion. Discover the world with personalized trip recommendations.',
      onboarding_completed: true,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: 'walvee@walvee.com'
    }, {});
  }
};
