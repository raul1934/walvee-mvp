const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const PlaceFavorite = sequelize.define(
  "PlaceFavorite",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    place_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "places",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "place_favorites",
    paranoid: true,
    timestamps: true,
    updatedAt: false,
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    indexes: [
      { fields: ["place_id"] },
      { fields: ["user_id"] },
      { unique: true, fields: ["place_id", "user_id"] },
    ],
  }
);

module.exports = PlaceFavorite;
