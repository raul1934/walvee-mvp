const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const TripItineraryActivity = sequelize.define(
  "TripItineraryActivity",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    itinerary_day_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "trip_itinerary_days",
        key: "id",
      },
    },
    time: {
      type: DataTypes.STRING(20),
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
    },
    description: {
      type: DataTypes.TEXT,
    },
    activity_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "trip_itinerary_activities",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["itinerary_day_id"] },
      { fields: ["activity_order"] },
    ],
  }
);

module.exports = TripItineraryActivity;
