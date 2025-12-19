const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const TripReview = sequelize.define(
  "TripReview",
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
    reviewer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    created_by: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Email or identifier of the user who created the review",
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
      comment:
        "Rating from 1-5 stars (can be integer or decimal for AI reviews)",
    },
    comment: {
      type: DataTypes.TEXT,
      comment: "Review text (user comment or AI-generated text)",
    },
    is_ai_generated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Flag to indicate if this review is AI-generated",
    },
  },
  {
    tableName: "trip_reviews",
    timestamps: true,
    indexes: [
      { fields: ["trip_id"] },
      { fields: ["reviewer_id"] },
      { fields: ["created_by"] },
      {
        fields: ["trip_id", "reviewer_id"],
        unique: true,
        where: { is_ai_generated: false },
      },
    ],
  }
);

module.exports = TripReview;
