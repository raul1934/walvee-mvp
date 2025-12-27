const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const TripCity = sequelize.define(
  "TripCity",
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
      allowNull: false,
      references: {
        model: "cities",
        key: "id",
      },
    },
    city_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "trip_cities",
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["trip_id", "city_id"],
        name: "idx_trip_cities_trip_city",
      },
    ],
  }
);

module.exports = TripCity;
