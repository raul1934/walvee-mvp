const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const Country = sequelize.define(
  "Country",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      unique: true,
      comment: "ISO 3166-1 alpha-2 country code",
    },
    google_maps_id: {
      type: DataTypes.STRING(255),
      unique: true,
      comment: "Google Maps Place ID for the country",
    },
    continent: {
      type: DataTypes.STRING(50),
    },
    flag_emoji: {
      type: DataTypes.STRING(10),
    },
  },
  {
    tableName: "countries",
    paranoid: true,
    timestamps: true,
    indexes: [
      { fields: ["code"] },
      { fields: ["name"] },
      { fields: ["google_maps_id"] },
    ],
  }
);

module.exports = Country;
