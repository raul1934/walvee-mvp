const { sequelize } = require("./sequelize");
const { QueryTypes } = require("sequelize");

/**
 * Migration script to transfer data from reviews table to new specialized tables
 */
const migrateReviewsData = async () => {
  try {
    console.log("[Data Migration] Starting migration from reviews table...");

    // Check if old reviews table exists
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'reviews'", {
      type: QueryTypes.SELECT,
    });

    if (!tables || Object.keys(tables).length === 0) {
      console.log(
        "[Data Migration] Old 'reviews' table not found. Skipping migration."
      );
      return;
    }

    // Get all reviews from old table
    const oldReviews = await sequelize.query(
      `SELECT * FROM reviews ORDER BY created_at ASC`,
      { type: QueryTypes.SELECT }
    );

    console.log(
      `[Data Migration] Found ${oldReviews.length} reviews to migrate`
    );

    let placeReviewsCount = 0;
    let tripReviewsCount = 0;
    let skippedCount = 0;

    for (const review of oldReviews) {
      try {
        // Get user email for created_by field
        const [user] = await sequelize.query(
          `SELECT email FROM users WHERE id = ?`,
          { replacements: [review.reviewer_id], type: QueryTypes.SELECT }
        );

        const createdBy = user?.email || review.reviewer_id;

        // Determine if it's AI-generated
        const isAiGenerated = review.is_ai_generated || false;
        const rating =
          isAiGenerated && review.ai_rating ? review.ai_rating : review.rating;
        const comment =
          isAiGenerated && review.ai_text ? review.ai_text : review.comment;

        // Migrate to place_reviews if it has a place_id
        if (review.place_id) {
          await sequelize.query(
            `INSERT INTO place_reviews 
            (id, place_id, reviewer_id, created_by, rating, comment, is_ai_generated, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
              replacements: [
                review.id,
                review.place_id,
                review.reviewer_id,
                createdBy,
                rating,
                comment,
                isAiGenerated,
                review.created_at,
                review.updated_at,
              ],
              type: QueryTypes.INSERT,
            }
          );
          placeReviewsCount++;
          console.log(`[Data Migration] ✓ Migrated place review: ${review.id}`);
        }
        // Migrate to trip_reviews if it has a trip_id (and no place_id to avoid duplicates)
        else if (review.trip_id) {
          await sequelize.query(
            `INSERT INTO trip_reviews 
            (id, trip_id, reviewer_id, created_by, rating, comment, is_ai_generated, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
              replacements: [
                review.id,
                review.trip_id,
                review.reviewer_id,
                createdBy,
                rating,
                comment,
                isAiGenerated,
                review.created_at,
                review.updated_at,
              ],
              type: QueryTypes.INSERT,
            }
          );
          tripReviewsCount++;
          console.log(`[Data Migration] ✓ Migrated trip review: ${review.id}`);
        }
        // Skip reviews that don't have trip_id or place_id
        else {
          skippedCount++;
          console.log(
            `[Data Migration] ⚠ Skipped review without trip_id or place_id: ${review.id}`
          );
        }
      } catch (error) {
        console.error(
          `[Data Migration] ✗ Error migrating review ${review.id}:`,
          error.message
        );
        skippedCount++;
      }
    }

    console.log("\n[Data Migration] Migration Summary:");
    console.log(`  ✓ Place reviews migrated: ${placeReviewsCount}`);
    console.log(`  ✓ Trip reviews migrated: ${tripReviewsCount}`);
    console.log(`  ⚠ Reviews skipped: ${skippedCount}`);
    console.log(`  📊 Total processed: ${oldReviews.length}`);

    console.log("\n[Data Migration] ✓ Data migration completed successfully!");
    console.log(
      "[Data Migration] Note: Old 'reviews' table still exists. You can drop it manually after verifying the migration."
    );
  } catch (error) {
    console.error("[Data Migration] Error during migration:", error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateReviewsData()
    .then(() => {
      console.log("\n[Data Migration] Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n[Data Migration] Migration script failed:", error);
      process.exit(1);
    });
}

module.exports = migrateReviewsData;
