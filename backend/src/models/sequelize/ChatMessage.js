const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const ChatMessage = sequelize.define(
  "ChatMessage",
  {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trip_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: "trips",
        key: "id",
      },
    },
    role: {
      type: DataTypes.ENUM("user", "assistant"),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    recommendations: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    city_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: "cities",
        key: "id",
      },
    },
    city_context: {
      type: DataTypes.STRING(255),
      allowNull: true,
      // TODO: FUTURE CLEANUP - Remove this column after city_id is fully adopted
      // Keep for backward compatibility with old messages that only have city_context
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "chat_messages",
    indexes: [
      { fields: ["trip_id", "timestamp"] },
      { fields: ["trip_id", "city_id"] }, // New index for city_id lookups
      { fields: ["trip_id", "city_context"] }, // Keep old index for backward compatibility
    ],
  }
);

module.exports = ChatMessage;
