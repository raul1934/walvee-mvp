const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");
const { getFullImageUrl } = require("../../utils/helpers");

const PlacePhoto = sequelize.define(
  "PlacePhoto",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    place_id: {
      type: DataTypes.UUID,
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
    url: {
      type: DataTypes.STRING(1000),
      comment: "Photo URL",
      get() {
        const rawValue = this.getDataValue("url");
        return getFullImageUrl(rawValue);
      },
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
    paranoid: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["place_id"] },
      { fields: ["place_id", "google_photo_reference"], unique: true },
      // Ensure each (place_id, photo_order) is unique to avoid duplicate orders
      { fields: ["place_id", "photo_order"], unique: true },
    ],
  }
);

module.exports = PlacePhoto;
