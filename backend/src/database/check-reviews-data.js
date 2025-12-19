const { sequelize } = require("./sequelize");

async function checkReviews() {
  try {
    const reviews = await sequelize.query("SELECT * FROM reviews", {
      type: sequelize.QueryTypes.SELECT,
    });

    console.log(`Found ${reviews.length} reviews:`);
    reviews.forEach((review, idx) => {
      console.log(`\nReview ${idx + 1}:`);
      console.log(`  ID: ${review.id}`);
      console.log(`  Trip ID: ${review.trip_id || "NULL"}`);
      console.log(`  Place ID: ${review.place_id || "NULL"}`);
      console.log(`  City ID: ${review.city_id || "NULL"}`);
      console.log(`  Reviewer ID: ${review.reviewer_id}`);
      console.log(`  Rating: ${review.rating}`);
      console.log(
        `  Comment: ${
          review.comment ? review.comment.substring(0, 50) + "..." : "NULL"
        }`
      );
      console.log(`  AI Generated: ${review.is_ai_generated}`);
    });

    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

checkReviews();
