"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if index already exists
    const tripLikesIndexes = await queryInterface.showIndex("trip_likes");
    const indexExists = tripLikesIndexes.some(
      (index) => index.name === "trip_likes_trip_id_liker_id_unique"
    );

    if (!indexExists) {
      // Remove any duplicate likes, keeping the earliest entry (lowest id)
      // Note: this is written for MySQL
      await queryInterface.sequelize.query(`
        DELETE t1 FROM trip_likes t1
        INNER JOIN trip_likes t2
          ON t1.trip_id = t2.trip_id
          AND t1.liker_id = t2.liker_id
          AND t1.id > t2.id
      `);

      await queryInterface.addIndex("trip_likes", ["trip_id", "liker_id"], {
        unique: true,
        name: "trip_likes_trip_id_liker_id_unique",
      });

      // Recalculate likes_count on trips to ensure consistency after dedupe
      await queryInterface.sequelize.query(`
        UPDATE trips
        SET likes_count = (
          SELECT COUNT(*) FROM trip_likes WHERE trip_likes.trip_id = trips.id
        )
      `);
    }
  },

  down: async (queryInterface) => {
    const tripLikesIndexes = await queryInterface.showIndex("trip_likes");
    const indexExists = tripLikesIndexes.some(
      (index) => index.name === "trip_likes_trip_id_liker_id_unique"
    );
    if (indexExists) {
      await queryInterface.removeIndex(
        "trip_likes",
        "trip_likes_trip_id_liker_id_unique"
      );
    }
  },
};
