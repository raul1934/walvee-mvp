const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const TripLike = sequelize.define(
  "TripLike",
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
    liker_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "trip_likes",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["trip_id"] },
      { fields: ["liker_id"] },
      { unique: true, fields: ["trip_id", "liker_id"] },
    ],
  }
);

module.exports = TripLike;
