const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const PlacePhoto = sequelize.define(
  "PlacePhoto",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    place_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "places",
        key: "id",
      },
    },
    google_photo_reference: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Google Maps photo reference",
    },
    url_small: {
      type: DataTypes.STRING(1000),
      comment: "Photo URL with maxWidth: 400",
    },
    url_medium: {
      type: DataTypes.STRING(1000),
      comment: "Photo URL with maxWidth: 800",
    },
    url_large: {
      type: DataTypes.STRING(1000),
      comment: "Photo URL with maxWidth: 1600",
    },
    width: {
      type: DataTypes.INTEGER,
    },
    height: {
      type: DataTypes.INTEGER,
    },
    attribution: {
      type: DataTypes.TEXT,
      comment: "Photo attribution/credit information",
    },
    photo_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Display order of photos for the place",
    },
  },
  {
    tableName: "place_photos",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["place_id"] },
      { fields: ["place_id", "google_photo_reference"], unique: true },
    ],
  }
);

module.exports = PlacePhoto;
