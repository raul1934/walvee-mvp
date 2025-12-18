const { sequelize, TripItineraryActivity, Place } = require("../models/sequelize");
const { Op } = require("sequelize");

/**
 * Link trip itinerary activities to places based on name matching
 */
async function linkActivitiesToPlaces() {
  try {
    console.log("Starting to link activities to places...\n");

    // Get all activities without place_id
    const activities = await TripItineraryActivity.findAll({
      where: {
        place_id: null,
      },
      attributes: ["id", "name", "location", "place_id"],
    });

    console.log(`Found ${activities.length} activities without place_id\n`);

    if (activities.length === 0) {
      console.log("No activities to link. All done!");
      return;
    }

    // Get all places
    const places = await Place.findAll({
      attributes: ["id", "name", "google_place_id", "address"],
    });

    console.log(`Found ${places.length} places in database\n`);

    let matchedCount = 0;
    let updates = [];

    // Try to match each activity with a place
    for (const activity of activities) {
      const activityName = activity.name.toLowerCase().trim();
      const activityLocation = (activity.location || "").toLowerCase().trim();

      // Try exact name match first
      let matchedPlace = places.find(
        (p) => p.name.toLowerCase().trim() === activityName
      );

      // Try location match if no exact name match
      if (!matchedPlace && activityLocation) {
        matchedPlace = places.find(
          (p) => p.name.toLowerCase().trim() === activityLocation
        );
      }

      // Try partial name match (both directions)
      if (!matchedPlace) {
        matchedPlace = places.find((p) => {
          const placeName = p.name.toLowerCase().trim();
          // Remove common prefixes/suffixes for better matching
          const cleanActivityName = activityName.replace(/\s+(temple|museum|park|building|tower|bridge|mall|waterfall)\s*$/i, '');
          const cleanPlaceName = placeName.replace(/\s+(temple|museum|park|building|tower|bridge|mall|waterfall)\s*$/i, '');

          return (
            placeName.includes(activityName) ||
            activityName.includes(placeName) ||
            cleanPlaceName.includes(cleanActivityName) ||
            cleanActivityName.includes(cleanPlaceName)
          );
        });
      }

      // Try matching key words for compound names
      if (!matchedPlace) {
        const activityWords = activityName.split(/\s+/).filter(w => w.length > 3);
        matchedPlace = places.find((p) => {
          const placeName = p.name.toLowerCase().trim();
          const placeWords = placeName.split(/\s+/).filter(w => w.length > 3);

          // If at least 2 words match, consider it a match
          const matchingWords = activityWords.filter(word =>
            placeWords.some(pw => pw.includes(word) || word.includes(pw))
          );

          return matchingWords.length >= Math.min(2, activityWords.length);
        });
      }

      if (matchedPlace) {
        updates.push({
          activityId: activity.id,
          placeId: matchedPlace.id,
          activityName: activity.name,
          placeName: matchedPlace.name,
        });
        matchedCount++;
      }
    }

    console.log(`\nMatched ${matchedCount} activities to places:\n`);

    // Display matches for confirmation
    updates.forEach((update, idx) => {
      console.log(
        `${idx + 1}. Activity: "${update.activityName}" -> Place: "${update.placeName}" (ID: ${update.placeId})`
      );
    });

    if (updates.length === 0) {
      console.log("\nNo matches found. Consider adding more places to the database.");
      return;
    }

    // Ask for confirmation (in script mode, auto-confirm)
    console.log(`\n\nUpdating ${updates.length} activities...`);

    // Perform updates
    for (const update of updates) {
      await TripItineraryActivity.update(
        { place_id: update.placeId },
        { where: { id: update.activityId } }
      );
    }

    console.log(`\n✅ Successfully linked ${updates.length} activities to places!`);

    // Show summary
    const totalActivities = await TripItineraryActivity.count();
    const linkedActivities = await TripItineraryActivity.count({
      where: { place_id: { [Op.ne]: null } },
    });

    console.log(`\nSummary:`);
    console.log(`  Total activities: ${totalActivities}`);
    console.log(`  Linked to places: ${linkedActivities}`);
    console.log(`  Not linked: ${totalActivities - linkedActivities}`);
  } catch (error) {
    console.error("Error linking activities to places:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  linkActivitiesToPlaces()
    .then(() => {
      console.log("\n✅ Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

module.exports = linkActivitiesToPlaces;
