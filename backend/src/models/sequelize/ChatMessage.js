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
    city_context: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
      { fields: ["trip_id", "city_context"] },
    ],
  }
);

module.exports = ChatMessage;
