const { sequelize } = require("./sequelize");
const { DataTypes } = require("sequelize");

const addAiReviewColumns = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();

    console.log("[Migration] Checking if ai_rating column exists...");
    const tableDescription = await queryInterface.describeTable("reviews");

    if (!tableDescription.ai_rating) {
      console.log("[Migration] Adding ai_rating column...");
      await queryInterface.addColumn("reviews", "ai_rating", {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: "AI-generated rating (1-5 stars)",
      });
    }

    if (!tableDescription.ai_text) {
      console.log("[Migration] Adding ai_text column...");
      await queryInterface.addColumn("reviews", "ai_text", {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "AI-generated review text",
      });
    }

    if (!tableDescription.is_ai_generated) {
      console.log("[Migration] Adding is_ai_generated column...");
      await queryInterface.addColumn("reviews", "is_ai_generated", {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Flag to indicate if this review is AI-generated",
      });
    }

    console.log("[Migration] AI review columns added successfully!");
  } catch (error) {
    console.error("[Migration] Error adding AI review columns:", error.message);
    throw error;
  }
};

module.exports = addAiReviewColumns;
