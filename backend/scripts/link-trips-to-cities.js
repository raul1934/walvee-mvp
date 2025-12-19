const { Trip, City, Country } = require("../src/models/sequelize");
const { Op } = require("sequelize");

/**
 * Script to link trips to cities by matching destination strings with cities in the database
 * This will update the destination_city_id field for trips that don't have it set
 */

async function linkTripsToCities() {
  console.log("Starting trip-to-city linking process...\n");

  try {
    // Get all trips without a destination_city_id
    const trips = await Trip.findAll({
      where: {
        [Op.or]: [
          { destination_city_id: null },
          { destination_city_id: { [Op.is]: null } },
        ],
        destination: { [Op.ne]: null },
      },
      attributes: ["id", "destination", "destination_city_id", "title"],
    });

    console.log(`Found ${trips.length} trips without city links\n`);

    if (trips.length === 0) {
      console.log("All trips are already linked to cities!");
      return;
    }

    // Get all cities with their countries for matching
    const cities = await City.findAll({
      include: [
        {
          model: Country,
          as: "country",
          attributes: ["name", "code"],
        },
      ],
      attributes: ["id", "name", "country_id", "state"],
    });

    console.log(`Loaded ${cities.length} cities from database\n`);

    let matchedCount = 0;
    let unmatchedTrips = [];

    for (const trip of trips) {
      const destination = trip.destination || "";
      const parts = destination.split(",").map((p) => p.trim());

      // Extract potential city name (first part of destination)
      const cityName = parts[0];

      if (!cityName) {
        unmatchedTrips.push({ id: trip.id, destination, reason: "Empty city name" });
        continue;
      }

      // Try to find matching city
      let matchedCity = null;

      // Strategy 1: Exact match (case-insensitive)
      matchedCity = cities.find(
        (city) => city.name.toLowerCase() === cityName.toLowerCase()
      );

      // Strategy 2: Match with country name in destination
      if (!matchedCity && parts.length > 1) {
        const countryPart = parts[parts.length - 1].toLowerCase();
        matchedCity = cities.find(
          (city) =>
            city.name.toLowerCase() === cityName.toLowerCase() &&
            city.country &&
            city.country.name.toLowerCase().includes(countryPart)
        );
      }

      // Strategy 3: Partial match (city name contains destination or vice versa)
      if (!matchedCity) {
        matchedCity = cities.find(
          (city) =>
            city.name.toLowerCase().includes(cityName.toLowerCase()) ||
            cityName.toLowerCase().includes(city.name.toLowerCase())
        );
      }

      if (matchedCity) {
        // Update trip with city ID
        await trip.update({ destination_city_id: matchedCity.id });
        matchedCount++;
        console.log(
          `✓ Matched "${destination}" -> ${matchedCity.name}, ${matchedCity.country?.name || "N/A"} (ID: ${matchedCity.id})`
        );
      } else {
        unmatchedTrips.push({ 
          id: trip.id, 
          title: trip.title,
          destination, 
          reason: "No matching city found" 
        });
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total trips processed: ${trips.length}`);
    console.log(`Successfully matched: ${matchedCount}`);
    console.log(`Unmatched: ${unmatchedTrips.length}`);

    if (unmatchedTrips.length > 0) {
      console.log("\n" + "-".repeat(60));
      console.log("UNMATCHED TRIPS:");
      console.log("-".repeat(60));
      unmatchedTrips.forEach((trip) => {
        console.log(`✗ ${trip.title || 'Untitled'}`);
        console.log(`  Destination: ${trip.destination}`);
        console.log(`  Reason: ${trip.reason}`);
        console.log("");
      });

      console.log("\nTip: You may need to add these cities to the database or manually set destination_city_id");
    }

    console.log("\nDone!");
  } catch (error) {
    console.error("Error linking trips to cities:", error);
    throw error;
  }
}

// Run the script
linkTripsToCities()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
