const { Trip, City, Country } = require("../src/models/sequelize");
const { Op } = require("sequelize");
const axios = require("axios");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error(
    "Error: GOOGLE_MAPS_API_KEY not found in environment variables"
  );
  process.exit(1);
}

/**
 * Geocode a location using Google Maps Geocoding API
 */
async function geocodeLocation(destination) {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: destination,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status === "OK" && response.data.results.length > 0) {
      return response.data.results[0];
    }

    return null;
  } catch (error) {
    console.error(`Error geocoding ${destination}:`, error.message);
    return null;
  }
}

/**
 * Extract city and country info from Google Maps geocoding result
 */
function extractCityInfo(geocodeResult) {
  const components = geocodeResult.address_components;
  let cityName = null;
  let countryName = null;
  let countryCode = null;
  let state = null;

  // Find city name (locality or administrative_area_level_1)
  for (const component of components) {
    if (component.types.includes("locality")) {
      cityName = component.long_name;
    }
    if (component.types.includes("administrative_area_level_1")) {
      state = component.long_name;
      if (!cityName) {
        cityName = component.long_name;
      }
    }
    if (component.types.includes("country")) {
      countryName = component.long_name;
      countryCode = component.short_name;
    }
  }

  const location = geocodeResult.geometry.location;

  return {
    cityName,
    countryName,
    countryCode,
    state,
    latitude: location.lat,
    longitude: location.lng,
    placeId: geocodeResult.place_id,
    formattedAddress: geocodeResult.formatted_address,
  };
}

/**
 * Find or create a country in the database
 */
async function findOrCreateCountry(countryName, countryCode) {
  if (!countryName || !countryCode) return null;

  let country = await Country.findOne({
    where: {
      [Op.or]: [{ name: countryName }, { code: countryCode }],
    },
  });

  if (!country) {
    console.log(`  Creating new country: ${countryName} (${countryCode})`);
    country = await Country.create({
      name: countryName,
      code: countryCode,
    });
  }

  return country;
}

/**
 * Find or create a city in the database
 */
async function findOrCreateCity(cityInfo) {
  if (!cityInfo.cityName) return null;

  // First try to find existing city
  let city = await City.findOne({
    where: {
      name: cityInfo.cityName,
    },
    include: [
      {
        model: Country,
        as: "country",
        where: cityInfo.countryCode
          ? { code: cityInfo.countryCode }
          : undefined,
        required: false,
      },
    ],
  });

  if (city) {
    console.log(`  Found existing city: ${city.name}, ${city.country?.name}`);
    return city;
  }

  // Create new city
  const country = await findOrCreateCountry(
    cityInfo.countryName,
    cityInfo.countryCode
  );

  if (!country) {
    console.log(`  Cannot create city without country`);
    return null;
  }

  console.log(`  Creating new city: ${cityInfo.cityName}, ${country.name}`);
  city = await City.create({
    name: cityInfo.cityName,
    country_id: country.id,
    latitude: cityInfo.latitude,
    longitude: cityInfo.longitude,
    google_maps_id: cityInfo.placeId,
    state: cityInfo.state,
  });

  // Reload with country
  await city.reload({
    include: [{ model: Country, as: "country" }],
  });

  return city;
}

/**
 * Main script
 */
async function addMissingCitiesAndLink() {
  console.log("Starting: Add missing cities and link trips\n");
  console.log("=".repeat(60));

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

    let matchedCount = 0;
    let createdCitiesCount = 0;
    let failedTrips = [];

    for (const trip of trips) {
      const destination = trip.destination || "";
      console.log(
        `\n[${matchedCount + failedTrips.length + 1}/${
          trips.length
        }] Processing: "${trip.title}"`
      );
      console.log(`  Destination: ${destination}`);

      // Geocode the destination
      const geocodeResult = await geocodeLocation(destination);

      if (!geocodeResult) {
        console.log(`  ✗ Could not geocode destination`);
        failedTrips.push({
          id: trip.id,
          title: trip.title,
          destination,
          reason: "Geocoding failed",
        });
        continue;
      }

      // Extract city info
      const cityInfo = extractCityInfo(geocodeResult);

      if (!cityInfo.cityName) {
        console.log(`  ✗ Could not extract city name from geocoding result`);
        failedTrips.push({
          id: trip.id,
          title: trip.title,
          destination,
          reason: "No city name found",
        });
        continue;
      }

      // Find or create city
      const city = await findOrCreateCity(cityInfo);

      if (!city) {
        console.log(`  ✗ Could not create city`);
        failedTrips.push({
          id: trip.id,
          title: trip.title,
          destination,
          reason: "City creation failed",
        });
        continue;
      }

      // Check if city was just created (within last 5 seconds)
      const wasCreated =
        city.created_at &&
        new Date(city.created_at).getTime() > Date.now() - 5000;
      if (wasCreated) {
        createdCitiesCount++;
      }

      // Link trip to city
      await trip.update({ destination_city_id: city.id });
      matchedCount++;
      console.log(
        `  ✓ Linked to city: ${city.name}, ${
          city.country?.name || "N/A"
        } (ID: ${city.id})`
      );

      // Rate limiting - wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total trips processed: ${trips.length}`);
    console.log(`Successfully linked: ${matchedCount}`);
    console.log(`New cities created: ${createdCitiesCount}`);
    console.log(`Failed: ${failedTrips.length}`);

    if (failedTrips.length > 0) {
      console.log("\n" + "-".repeat(60));
      console.log("FAILED TRIPS:");
      console.log("-".repeat(60));
      failedTrips.forEach((trip) => {
        console.log(`✗ ${trip.title || "Untitled"}`);
        console.log(`  Destination: ${trip.destination}`);
        console.log(`  Reason: ${trip.reason}`);
        console.log("");
      });
    }

    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Run the script
addMissingCitiesAndLink()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
