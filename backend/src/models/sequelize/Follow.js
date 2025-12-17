const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const Follow = sequelize.define(
  "Follow",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    follower_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    followee_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    followee_email: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "follows",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["follower_id"] },
      { fields: ["followee_id"] },
      { unique: true, fields: ["follower_id", "followee_id"] },
    ],
  }
);

module.exports = Follow;
