const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trip_id: {
      type: DataTypes.UUID,
      references: {
        model: "trips",
        key: "id",
      },
    },
    place_id: {
      type: DataTypes.STRING(255),
    },
    reviewer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "reviews",
    indexes: [
      { fields: ["trip_id"] },
      { fields: ["place_id"] },
      { fields: ["reviewer_id"] },
    ],
  }
);

module.exports = Review;
