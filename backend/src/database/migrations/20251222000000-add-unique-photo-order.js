"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check and add unique index to city_photos (city_id, photo_order)
    const cityPhotosIndexes = await queryInterface.showIndex("city_photos");
    const cityIndexExists = cityPhotosIndexes.some(
      (index) => index.name === "city_photos_city_id_photo_order_unique"
    );
    if (!cityIndexExists) {
      await queryInterface.addIndex("city_photos", ["city_id", "photo_order"], {
        unique: true,
        name: "city_photos_city_id_photo_order_unique",
      });
    }

    // Check and add unique index to place_photos (place_id, photo_order)
    const placePhotosIndexes = await queryInterface.showIndex("place_photos");
    const placeIndexExists = placePhotosIndexes.some(
      (index) => index.name === "place_photos_place_id_photo_order_unique"
    );
    if (!placeIndexExists) {
      await queryInterface.addIndex(
        "place_photos",
        ["place_id", "photo_order"],
        {
          unique: true,
          name: "place_photos_place_id_photo_order_unique",
        }
      );
    }
  },

  down: async (queryInterface) => {
    const cityPhotosIndexes = await queryInterface.showIndex("city_photos");
    const cityIndexExists = cityPhotosIndexes.some(
      (index) => index.name === "city_photos_city_id_photo_order_unique"
    );
    if (cityIndexExists) {
      await queryInterface.removeIndex(
        "city_photos",
        "city_photos_city_id_photo_order_unique"
      );
    }

    const placePhotosIndexes = await queryInterface.showIndex("place_photos");
    const placeIndexExists = placePhotosIndexes.some(
      (index) => index.name === "place_photos_place_id_photo_order_unique"
    );
    if (placeIndexExists) {
      await queryInterface.removeIndex(
        "place_photos",
        "place_photos_place_id_photo_order_unique"
      );
    }
  },
};
