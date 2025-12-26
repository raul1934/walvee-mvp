const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const TripItineraryDay = sequelize.define(
  "TripItineraryDay",
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
    city_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "cities",
        key: "id",
      },
      comment: "Links itinerary day to a specific city for multi-city trips",
    },
    day_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "trip_itinerary_days",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["trip_id"] },
      { fields: ["day_number"] },
      { fields: ["trip_id", "city_id"] },
      { unique: true, fields: ["trip_id", "city_id", "day_number"] },
    ],
  }
);

module.exports = TripItineraryDay;
