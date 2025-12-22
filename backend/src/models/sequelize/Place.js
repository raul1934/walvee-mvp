const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const Place = sequelize.define(
  "Place",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    google_place_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: "Google Maps Place ID",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
    },
    city_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "cities",
        key: "id",
      },
    },
    latitude: {
      type: DataTypes.DOUBLE,
    },
    longitude: {
      type: DataTypes.DOUBLE,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
    },
    user_ratings_total: {
      type: DataTypes.INTEGER,
    },
    price_level: {
      type: DataTypes.INTEGER,
    },
    types: {
      type: DataTypes.JSON,
      comment: "Array of place types from Google Maps",
    },
    phone_number: {
      type: DataTypes.STRING(50),
    },
    website: {
      type: DataTypes.STRING(500),
    },
    opening_hours: {
      type: DataTypes.JSON,
      comment: "Opening hours information from Google Maps",
    },
    visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment:
        "Whether place should be visible in searches (false for cities saved as places)",
    },
  },
  {
    tableName: "places",
    timestamps: true,
    indexes: [
      { fields: ["google_place_id"] },
      { fields: ["city_id"] },
      { fields: ["name"] },
      { fields: ["latitude", "longitude"] },
    ],
  }
);

// Hook to automatically fetch photos after place creation
Place.afterCreate(async (place) => {
  const { checkPlacePhotos } = require("../../utils/photoChecker");
  await checkPlacePhotos(place);
});

module.exports = Place;
