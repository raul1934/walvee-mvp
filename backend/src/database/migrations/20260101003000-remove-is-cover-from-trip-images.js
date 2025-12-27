'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('trip_images', 'is_cover');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('trip_images', 'is_cover', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  }
};
