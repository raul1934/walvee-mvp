const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const City = sequelize.define(
  "City",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "countries",
        key: "id",
      },
    },
    google_maps_id: {
      type: DataTypes.STRING(255),
      unique: true,
      comment: "Google Maps Place ID for the city",
    },
    state: {
      type: DataTypes.STRING(100),
      comment: "State/Province/Region",
    },
    latitude: {
      type: DataTypes.DOUBLE,
    },
    longitude: {
      type: DataTypes.DOUBLE,
    },
    timezone: {
      type: DataTypes.STRING(50),
    },
    population: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "cities",
    timestamps: true,
    indexes: [
      { fields: ["country_id"] },
      { fields: ["name"] },
      { fields: ["google_maps_id"] },
      { fields: ["name", "country_id"], unique: true },
    ],
  }
);

module.exports = City;
