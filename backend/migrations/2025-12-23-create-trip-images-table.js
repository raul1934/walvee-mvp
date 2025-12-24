module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create trip_images table
    await queryInterface.createTable("trip_images", {
      id: {
        type: "CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        primaryKey: true,
      },
      trip_id: {
        type: "CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        allowNull: false,
      },
      place_photo_id: {
        type: "CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        allowNull: true,
      },
      city_photo_id: {
        type: "CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        allowNull: true,
      },
      is_cover: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      image_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add foreign key constraints first
    await queryInterface.addConstraint("trip_images", {
      fields: ["trip_id"],
      type: "foreign key",
      name: "fk_trip_images_trip",
      references: {
        table: "trips",
        field: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("trip_images", {
      fields: ["place_photo_id"],
      type: "foreign key",
      name: "fk_trip_images_place_photo",
      references: {
        table: "place_photos",
        field: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("trip_images", {
      fields: ["city_photo_id"],
      type: "foreign key",
      name: "fk_trip_images_city_photo",
      references: {
        table: "city_photos",
        field: "id",
      },
      onDelete: "CASCADE",
    });

    // Add indexes
    await queryInterface.addIndex("trip_images", ["trip_id"]);
    await queryInterface.addIndex("trip_images", ["place_photo_id"]);
    await queryInterface.addIndex("trip_images", ["city_photo_id"]);
    await queryInterface.addIndex("trip_images", ["trip_id", "is_cover"]);

    // Add constraint: at least one of place_photo_id or city_photo_id must be set
    await queryInterface.sequelize.query(`
      ALTER TABLE trip_images
      ADD CONSTRAINT check_photo_reference
      CHECK (
        (place_photo_id IS NOT NULL AND city_photo_id IS NULL) OR
        (place_photo_id IS NULL AND city_photo_id IS NOT NULL)
      )
    `);

    // Remove cover_image column from trips table
    await queryInterface.removeColumn("trips", "cover_image");
  },

  down: async (queryInterface, Sequelize) => {
    // Add back cover_image column to trips
    await queryInterface.addColumn("trips", "cover_image", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Drop trip_images table
    await queryInterface.dropTable("trip_images");
  },
};
