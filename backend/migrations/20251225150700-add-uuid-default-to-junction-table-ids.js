"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const junctionTables = ["trip_cities", "trip_places", "trip_tags"];

    for (const table of junctionTables) {
      try {
        const desc = await queryInterface.describeTable(table);
        if (!desc.id) {
          console.log(`Skipping ${table} - no id column found`);
          continue;
        }

        // If id column exists and has no default UUID(), set it to CHAR(36) NOT NULL DEFAULT (UUID())
        // Use changeColumn to make it explicit and safe
        await queryInterface.changeColumn(table, "id", {
          type: Sequelize.CHAR(36),
          allowNull: false,
          defaultValue: Sequelize.literal("(UUID())"),
        });

        console.log(`✓ Ensured id DEFAULT UUID() on ${table}`);
      } catch (err) {
        console.error(`Error updating ${table}: ${err.message}`);
        throw err;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const junctionTables = ["trip_cities", "trip_places", "trip_tags"];

    for (const table of junctionTables) {
      try {
        const desc = await queryInterface.describeTable(table);
        if (!desc.id) continue;

        // Remove the default but keep type and not-null so existing rows remain consistent
        await queryInterface.changeColumn(table, "id", {
          type: Sequelize.CHAR(36),
          allowNull: false,
          defaultValue: null,
        });

        console.log(`✓ Removed id DEFAULT on ${table}`);
      } catch (err) {
        console.error(`Error reverting ${table}: ${err.message}`);
      }
    }
  },
};
