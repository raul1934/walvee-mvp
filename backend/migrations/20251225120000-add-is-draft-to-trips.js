"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable("trips");

    if (!tableDescription.is_draft) {
      await queryInterface.addColumn("trips", "is_draft", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "Whether trip is still being created (true) or published (false)",
      });

      // Set existing trips to published (is_draft=false)
      await queryInterface.sequelize.query(`
        UPDATE trips SET is_draft = false WHERE is_draft IS NULL
      `);

      // Add composite index for efficient draft trip queries
      await queryInterface.addIndex("trips", ["author_id", "is_draft", "updated_at"], {
        name: "idx_trips_author_draft_updated",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable("trips");

    if (tableDescription.is_draft) {
      await queryInterface.removeIndex("trips", "idx_trips_author_draft_updated");
      await queryInterface.removeColumn("trips", "is_draft");
    }
  },
};
