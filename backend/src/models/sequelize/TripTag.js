const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const TripTag = sequelize.define(
  "TripTag",
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
    tag: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "trip_tags",
    paranoid: true,
    timestamps: true,
    updatedAt: false,
    indexes: [{ fields: ["trip_id"] }, { fields: ["tag"] }],
  }
);

module.exports = TripTag;
