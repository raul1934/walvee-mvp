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
    city_id: {
      // Use UUID to match `cities.id` which is a UUID PK
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "cities",
        key: "id",
      },
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "User's date of birth (YYYY-MM-DD)",
    },
    gender: {
      type: DataTypes.ENUM(
        "male",
        "female",
        "non-binary",
        "other",
        "prefer-not-to-say"
      ),
      allowNull: true,
    },
    instagram_username: {
      type: DataTypes.STRING(50),
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
