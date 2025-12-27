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
    place_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "places",
        key: "id",
      },
      comment: "Link to cached Google Maps place data",
    },
  },
  {
    tableName: "trip_itinerary_activities",
    paranoid: true,
    timestamps: true,
    updatedAt: false,
    indexes: [{ fields: ["itinerary_day_id"] }, { fields: ["activity_order"] }, { fields: ["place_id"] }],
  }
);

module.exports = TripItineraryActivity;
