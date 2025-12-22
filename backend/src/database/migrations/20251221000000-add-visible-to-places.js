"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("places", "visible", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment:
        "Whether place should be visible in searches (false for cities saved as places)",
    });

    // Set visible=false for places that are cities (have locality and political types)
    await queryInterface.sequelize.query(`
      UPDATE places 
      SET visible = false 
      WHERE JSON_CONTAINS(types, '"locality"') 
        AND JSON_CONTAINS(types, '"political"')
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("places", "visible");
  },
};
