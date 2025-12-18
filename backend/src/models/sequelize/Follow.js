const { DataTypes } = require("sequelize");
const { sequelize } = require("../../database/sequelize");

const Follow = sequelize.define(
  "Follow",
  {
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
  },
  {
    tableName: "user_follow",
    timestamps: true,
    indexes: [
      { fields: ["followee_id"] },
      { fields: ["follower_id"] },
      { unique: true, fields: ["followee_id", "follower_id"] },
    ],
  }
);

module.exports = Follow;
