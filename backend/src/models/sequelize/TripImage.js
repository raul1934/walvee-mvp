const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const TripImage = sequelize.define(
  "TripImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trip_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "trips",
        key: "id",
      },
    },
    place_photo_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "place_photos",
        key: "id",
      },
    },
    city_photo_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "city_photos",
        key: "id",
      },
    },
    is_cover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    image_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "trip_images",
    paranoid: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["trip_id"] },
      { fields: ["place_photo_id"] },
      { fields: ["city_photo_id"] },
      { fields: ["trip_id", "is_cover"] },
    ],
  }
);

module.exports = TripImage;
