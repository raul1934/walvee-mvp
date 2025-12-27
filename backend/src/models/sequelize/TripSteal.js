const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const TripSteal = sequelize.define(
  "TripSteal",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    original_trip_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "trips",
        key: "id",
      },
    },
    new_trip_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "trips",
        key: "id",
      },
    },
    original_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    new_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "trip_steals",
    paranoid: true,
    indexes: [
      { fields: ["original_trip_id"] },
      { fields: ["new_trip_id"] },
      { fields: ["original_user_id"] },
      { fields: ["new_user_id"] },
    ],
  }
);

module.exports = TripSteal;
