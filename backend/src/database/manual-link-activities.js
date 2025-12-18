const { sequelize, TripItineraryActivity, Place } = require("../models/sequelize");

/**
 * Manually link specific activities that don't match due to special characters or spelling
 */
async function manualLinkActivities() {
  try {
    console.log("Manually linking specific activities...\n");

    // Define manual mappings
    const manualMappings = [
      {
        activityName: "Sagrada Familia",
        placeName: "Basílica de la Sagrada Família",
      },
      {
        activityName: "Senso-ji Temple",
        placeName: "Sensō-ji",
      },
      {
        activityName: "Sunset Meditation",
        placeName: "Campuhan Ridge Walk",
      },
    ];

    let linkedCount = 0;

    for (const mapping of manualMappings) {
      // Find the place
      const place = await Place.findOne({
        where: sequelize.where(
          sequelize.fn("LOWER", sequelize.col("name")),
          "LIKE",
          `%${mapping.placeName.toLowerCase()}%`
        ),
      });

      if (!place) {
        console.log(`❌ Place not found: ${mapping.placeName}`);
        continue;
      }

      // Find and update activities
      const activities = await TripItineraryActivity.findAll({
        where: {
          name: { [require("sequelize").Op.like]: `%${mapping.activityName}%` },
          place_id: null,
        },
      });

      if (activities.length === 0) {
        console.log(`⏭️  No unlinked activities found for: ${mapping.activityName}`);
        continue;
      }

      // Update all matching activities
      for (const activity of activities) {
        await activity.update({ place_id: place.id });
        console.log(
          `✅ Linked: "${activity.name}" → "${place.name}" (ID: ${place.id})`
        );
        linkedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Manually linked: ${linkedCount} activities`);

    // Show final stats
    const totalActivities = await TripItineraryActivity.count();
    const linkedActivities = await TripItineraryActivity.count({
      where: { place_id: { [require("sequelize").Op.ne]: null } },
    });

    console.log(`\n📈 Overall Stats:`);
    console.log(`  Total activities: ${totalActivities}`);
    console.log(`  Linked to places: ${linkedActivities} (${Math.round((linkedActivities / totalActivities) * 100)}%)`);
    console.log(`  Not linked: ${totalActivities - linkedActivities}`);
  } catch (error) {
    console.error("Error manually linking activities:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  manualLinkActivities()
    .then(() => {
      console.log("\n✅ Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

module.exports = manualLinkActivities;
