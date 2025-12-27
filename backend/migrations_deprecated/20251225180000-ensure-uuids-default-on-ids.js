"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = [
      "users",
      "trips",
      "cities",
      "countries",
      "places",
      "trip_cities",
      "trip_places",
      "trip_tags",
      "trip_likes",
      "trip_images",
      "trip_comments",
      "trip_itinerary_days",
      "trip_itinerary_activities",
      "place_photos",
      "city_photos",
      "reviews",
      "place_reviews",
      "chat_messages",
    ];

    for (const table of tables) {
      try {
        const desc = await queryInterface.describeTable(table);
        if (!desc.id) {
          console.log(`Skipping ${table} - no id column found`);
          continue;
        }

        // If id column exists but is not CHAR(36) or missing default, change it
        const needsChange =
          !/char\(36\)/i.test(String(desc.id.type || "")) ||
          desc.id.defaultValue == null;

        if (needsChange) {
          await queryInterface.changeColumn(table, "id", {
            type: Sequelize.CHAR(36),
            allowNull: false,
            defaultValue: Sequelize.literal("(UUID())"),
          });
          console.log(`✓ Ensured id DEFAULT UUID() on ${table}`);
        } else {
          console.log(`✓ ${table}.id already CHAR(36) with default`);
        }
      } catch (err) {
        console.error(`Error updating ${table}: ${err.message}`);
        throw err;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = [
      "users",
      "trips",
      "cities",
      "countries",
      "places",
      "trip_cities",
      "trip_places",
      "trip_tags",
      "trip_likes",
      "trip_images",
      "trip_comments",
      "trip_itinerary_days",
      "trip_itinerary_activities",
      "place_photos",
      "city_photos",
      "reviews",
      "place_reviews",
      "chat_messages",
    ];

    for (const table of tables) {
      try {
        const desc = await queryInterface.describeTable(table);
        if (!desc.id) continue;

        // Remove default but keep CHAR(36)
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
