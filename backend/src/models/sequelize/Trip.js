const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const Trip = sequelize.define(
  "Trip",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    // destination and destination_city_id removed - use many-to-many trip_cities instead
    description: {
      type: DataTypes.TEXT,
    },
    duration: {
      type: DataTypes.STRING(50),
    },
    budget: {
      type: DataTypes.STRING(50),
    },
    transportation: {
      type: DataTypes.STRING(255),
    },
    accommodation: {
      type: DataTypes.STRING(255),
    },
    best_time_to_visit: {
      type: DataTypes.STRING(255),
    },
    difficulty_level: {
      type: DataTypes.STRING(50),
    },
    trip_type: {
      type: DataTypes.STRING(50),
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    destination_lat: {
      type: DataTypes.DOUBLE,
    },
    destination_lng: {
      type: DataTypes.DOUBLE,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_draft: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    tableName: "trips",
    paranoid: true,
    indexes: [
      { fields: ["author_id"] },
      // destination indexes removed
      { fields: ["is_public"] },
      { fields: ["is_featured"] },
      { fields: ["created_at"] },
      { fields: ["author_id", "is_draft", "updated_at"] },
    ],
  }
);

module.exports = Trip;
