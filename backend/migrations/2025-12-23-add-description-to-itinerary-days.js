module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("trip_itinerary_days", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "title",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("trip_itinerary_days", "description");
  },
};
