const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const TripPlace = sequelize.define(
  "TripPlace",
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
    },
    price_level: {
      type: DataTypes.INTEGER,
    },
    types: {
      type: DataTypes.JSON,
    },
    description: {
      type: DataTypes.TEXT,
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    place_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "places",
        key: "id",
      },
      comment: "Link to cached Google Maps place data",
    },
  },
  {
    tableName: "trip_places",
    timestamps: true,
    updatedAt: false,
    indexes: [{ fields: ["trip_id"] }],
  }
);

module.exports = TripPlace;
