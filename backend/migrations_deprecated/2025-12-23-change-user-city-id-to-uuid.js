module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Note: Run this migration after backing up your data. If you have numeric city ids,
    // they may need to be migrated or cleared before changing the column type.
    await queryInterface.changeColumn("users", "city_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "cities",
        key: "id",
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("users", "city_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "cities",
        key: "id",
      },
    });
  },
};
