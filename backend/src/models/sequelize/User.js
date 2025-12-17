const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    google_id: {
      type: DataTypes.STRING(255),
      unique: true,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    preferred_name: {
      type: DataTypes.STRING(100),
    },
    photo_url: {
      type: DataTypes.TEXT,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    city: {
      type: DataTypes.STRING(100),
    },
    country: {
      type: DataTypes.STRING(100),
    },
    instagram_username: {
      type: DataTypes.STRING(50),
    },
    metrics_followers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metrics_following: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metrics_trips: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metrics_likes_received: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    onboarding_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "users",
    indexes: [{ fields: ["email"] }, { fields: ["google_id"] }],
  }
);

module.exports = User;
