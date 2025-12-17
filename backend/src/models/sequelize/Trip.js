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
    destination: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Deprecated - use destination_city_id instead",
    },
    destination_city_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "cities",
        key: "id",
      },
    },
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
    cover_image: {
      type: DataTypes.TEXT,
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
    likes_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "trips",
    indexes: [
      { fields: ["author_id"] },
      { fields: ["destination"] },
      { fields: ["destination_city_id"] },
      { fields: ["is_public"] },
      { fields: ["is_featured"] },
      { fields: ["created_at"] },
      { fields: ["likes_count"] },
    ],
  }
);

module.exports = Trip;
