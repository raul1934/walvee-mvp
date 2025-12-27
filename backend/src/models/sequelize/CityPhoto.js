const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const CityPhoto = sequelize.define(
  "CityPhoto",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    city_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "cities",
        key: "id",
      },
    },
    google_photo_reference: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Google Maps photo reference",
    },
    url: {
      type: DataTypes.STRING(1000),
      comment: "Photo URL",
    },
    attribution: {
      type: DataTypes.TEXT,
      comment: "Photo attribution/credit information",
    },
    photo_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Display order of photos for the city",
    },
  },
  {
    tableName: "city_photos",
    paranoid: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["city_id"] },
      { fields: ["city_id", "google_photo_reference"], unique: true },
      // Ensure each (city_id, photo_order) is unique to avoid duplicate orders
      { fields: ["city_id", "photo_order"], unique: true },
    ],
  }
);

module.exports = CityPhoto;
