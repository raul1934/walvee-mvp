"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add unique index to city_photos (city_id, photo_order)
    await queryInterface.addIndex("city_photos", ["city_id", "photo_order"], {
      unique: true,
      name: "city_photos_city_id_photo_order_unique",
    });

    // Add unique index to place_photos (place_id, photo_order)
    await queryInterface.addIndex("place_photos", ["place_id", "photo_order"], {
      unique: true,
      name: "place_photos_place_id_photo_order_unique",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex(
      "city_photos",
      "city_photos_city_id_photo_order_unique"
    );
    await queryInterface.removeIndex(
      "place_photos",
      "place_photos_place_id_photo_order_unique"
    );
  },
};
