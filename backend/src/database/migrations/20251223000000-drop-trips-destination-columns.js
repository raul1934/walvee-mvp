"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // If destination_city_id exists, drop FK/index then column
    const tableDescription = await queryInterface.describeTable("trips");
    if (tableDescription.destination_city_id) {
      try {
        await queryInterface.removeConstraint(
          "trips",
          "fk_trips_destination_city_id"
        );
      } catch (e) {
        // ignore if constraint not present
      }
      try {
        await queryInterface.removeIndex("trips", "idx_destination_city_id");
      } catch (e) {
        // ignore
      }
      await queryInterface.removeColumn("trips", "destination_city_id");
      console.log("✓ Dropped destination_city_id from trips");
    }

    // Drop legacy destination column if exists
    if (tableDescription.destination) {
      await queryInterface.removeColumn("trips", "destination");
      console.log("✓ Dropped destination column from trips");
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Recreate destination and destination_city_id columns for rollback convenience
    await queryInterface.addColumn("trips", "destination", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("trips", "destination_city_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "cities",
        key: "id",
      },
    });
    await queryInterface.addIndex("trips", ["destination_city_id"], {
      name: "idx_destination_city_id",
    });
    console.log(
      "✓ Restored destination and destination_city_id columns on rollback"
    );
  },
};
