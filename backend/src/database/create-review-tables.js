const { sequelize } = require("./sequelize");
const { QueryTypes, DataTypes } = require("sequelize");

/**
 * Migration to create new review tables: place_reviews, trip_reviews, city_reviews
 * and migrate data from the old reviews table
 */
const createReviewTables = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();

    console.log("[Migration] Creating new review tables...");

    // 1. Create place_reviews table
    console.log("[Migration] Creating place_reviews table...");
    await queryInterface.createTable(
      "place_reviews",
      {
        id: {
          type: DataTypes.CHAR(36),
          primaryKey: true,
        },
        place_id: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: "Google Maps Place ID",
        },
        reviewer_id: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        created_by: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: "Email or identifier of the user who created the review",
        },
        rating: {
          type: DataTypes.FLOAT,
          allowNull: false,
          comment: "Rating from 1-5 stars",
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: "Review text",
        },
        price_opinion: {
          type: DataTypes.ENUM("cheap", "fair", "expensive", "very_expensive"),
          allowNull: true,
          comment: "User's opinion about the price level",
        },
        is_ai_generated: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          comment: "Flag to indicate if this review is AI-generated",
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      }
    );

    // Add indexes for place_reviews
    await queryInterface.addIndex("place_reviews", ["place_id"], {
      name: "idx_place_reviews_place_id",
    });
    await queryInterface.addIndex("place_reviews", ["reviewer_id"], {
      name: "idx_place_reviews_reviewer_id",
    });
    await queryInterface.addIndex("place_reviews", ["created_by"], {
      name: "idx_place_reviews_created_by",
    });
    await queryInterface.addIndex(
      "place_reviews",
      ["place_id", "is_ai_generated"],
      {
        name: "idx_place_reviews_place_ai",
      }
    );

    console.log("[Migration] ✓ place_reviews table created");

    // 2. Create trip_reviews table
    console.log("[Migration] Creating trip_reviews table...");
    await queryInterface.createTable(
      "trip_reviews",
      {
        id: {
          type: DataTypes.CHAR(36),
          primaryKey: true,
        },
        trip_id: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          references: {
            model: "trips",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        reviewer_id: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        created_by: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: "Email or identifier of the user who created the review",
        },
        rating: {
          type: DataTypes.FLOAT,
          allowNull: false,
          comment: "Rating from 1-5 stars",
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: "Review text",
        },
        is_ai_generated: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          comment: "Flag to indicate if this review is AI-generated",
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      }
    );

    // Add indexes for trip_reviews
    await queryInterface.addIndex("trip_reviews", ["trip_id"], {
      name: "idx_trip_reviews_trip_id",
    });
    await queryInterface.addIndex("trip_reviews", ["reviewer_id"], {
      name: "idx_trip_reviews_reviewer_id",
    });
    await queryInterface.addIndex("trip_reviews", ["created_by"], {
      name: "idx_trip_reviews_created_by",
    });

    console.log("[Migration] ✓ trip_reviews table created");

    // 3. Create city_reviews table
    console.log("[Migration] Creating city_reviews table...");
    await queryInterface.createTable(
      "city_reviews",
      {
        id: {
          type: DataTypes.CHAR(36),
          primaryKey: true,
        },
        city_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "cities",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        reviewer_id: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        created_by: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: "Email or identifier of the user who created the review",
        },
        rating: {
          type: DataTypes.FLOAT,
          allowNull: false,
          comment: "Rating from 1-5 stars",
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: "Review text",
        },
        is_ai_generated: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          comment: "Flag to indicate if this review is AI-generated",
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      }
    );

    // Add indexes for city_reviews
    await queryInterface.addIndex("city_reviews", ["city_id"], {
      name: "idx_city_reviews_city_id",
    });
    await queryInterface.addIndex("city_reviews", ["reviewer_id"], {
      name: "idx_city_reviews_reviewer_id",
    });
    await queryInterface.addIndex("city_reviews", ["created_by"], {
      name: "idx_city_reviews_created_by",
    });

    console.log("[Migration] ✓ city_reviews table created");
    console.log("[Migration] All review tables created successfully!");
  } catch (error) {
    console.error("[Migration] Error creating review tables:", error.message);
    throw error;
  }
};

module.exports = createReviewTables;
