const { TripItineraryActivity } = require("../models/sequelize");

async function listUnlinkedActivities() {
  try {
    const activities = await TripItineraryActivity.findAll({
      where: { place_id: null },
      attributes: ["name", "location"],
    });

    // Group by similar patterns to identify what places we need
    const grouped = {};
    activities.forEach((a) => {
      const key = a.name + " | " + (a.location || "No location");
      if (!grouped[key]) {
        grouped[key] = 0;
      }
      grouped[key]++;
    });

    console.log("Unlinked activities (" + activities.length + " total):");
    console.log("=".repeat(80));

    const entries = Object.entries(grouped);
    entries.forEach(([key, count], idx) => {
      const [name, location] = key.split(" | ");
      console.log(idx + 1 + ". " + name);
      console.log("   Location: " + location);
      if (count > 1) {
        console.log("   (appears " + count + " times)");
      }
      console.log("");
    });

    console.log("\nSummary:");
    console.log("  Unique unlinked activities: " + entries.length);
    console.log("  Total instances: " + activities.length);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

listUnlinkedActivities();
