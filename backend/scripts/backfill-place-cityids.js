const { getConnection } = require("../src/database/connection");
const {
  getPlaceDetailsWithPhotos,
  getCityDetailsWithPhotos,
} = require("../src/services/googleMapsService");

/**
 * backfill-place-cityids.js
 * One-time backfill to set city_id for Place rows that have a google_place_id
 * but no city_id set.
 *
 * Usage:
 *  DRY_RUN=1 node backend/scripts/backfill-place-cityids.js   # don't write to DB
 *  node backend/scripts/backfill-place-cityids.js            # perform updates
 *
 * Options via env:
 *  LIMIT - limit number of places processed
 *  SKIP_GOOGLE - skip Google Maps calls (use only address parsing)
 */

const DRY_RUN = !!process.env.DRY_RUN;
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : null;
const SKIP_GOOGLE = !!process.env.SKIP_GOOGLE;

// Safety: require explicit confirmation for live run
if (!DRY_RUN && process.env.CONFIRM !== "1") {
  console.log(
    "\n⚠️  To perform database updates in non-dry mode you must set CONFIRM=1"
  );
  console.log(
    "Example (PowerShell): $env:CONFIRM=1; node .\\backend\\scripts\\backfill-place-cityids.js"
  );
  console.log(
    "Example (Linux/macOS): CONFIRM=1 node backend/scripts/backfill-place-cityids.js"
  );
  process.exit(0);
}

async function extractCityCountryFromPlaceDetails(placeDetails) {
  if (!placeDetails || !placeDetails.address_components) return {};

  let city = null;
  let country = null;

  for (const component of placeDetails.address_components) {
    if (
      !city &&
      (component.types.includes("locality") ||
        component.types.includes("postal_town") ||
        component.types.includes("administrative_area_level_2"))
    ) {
      city = component.long_name;
    }
    if (!country && component.types.includes("country")) {
      country = component.long_name;
    }
  }

  return { city, country };
}

async function upsertCountryAndCity(
  connection,
  cityName,
  countryName,
  googleMapsId = null
) {
  // Find or create country
  let countryRow = null;
  if (countryName) {
    const [rows] = await connection.query(
      "SELECT id, name FROM countries WHERE name = ? LIMIT 1",
      [countryName]
    );
    if (rows.length > 0) countryRow = rows[0];
    else {
      const [res] = await connection.query(
        "INSERT INTO countries (id, name, created_at, updated_at) VALUES (UUID(), ?, NOW(), NOW())",
        [countryName]
      );
      // Fetch inserted
      const [r2] = await connection.query(
        "SELECT id, name FROM countries WHERE name = ? LIMIT 1",
        [countryName]
      );
      countryRow = r2[0];
      console.log(`Created country: ${countryName} (${countryRow.id})`);
    }
  }

  // Find or create city
  let cityRow = null;
  if (cityName) {
    const [rows] = await connection.query(
      "SELECT id, name FROM cities WHERE name = ? AND country_id <=> ? LIMIT 1",
      [cityName, countryRow ? countryRow.id : null]
    );
    if (rows.length > 0) cityRow = rows[0];
    else {
      const [res] = await connection.query(
        "INSERT INTO cities (id, name, country_id, google_maps_id, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())",
        [cityName, countryRow ? countryRow.id : null, googleMapsId]
      );
      const [r2] = await connection.query(
        "SELECT id, name FROM cities WHERE name = ? AND country_id <=> ? LIMIT 1",
        [cityName, countryRow ? countryRow.id : null]
      );
      cityRow = r2[0];
      console.log(`Created city: ${cityName} (${cityRow.id})`);
    }
  }

  return { city: cityRow, country: countryRow };
}

async function run() {
  console.log(
    "\n🏗️  BACKFILL: Populate city_id for places with google_place_id\n"
  );
  console.log(
    `DRY_RUN: ${DRY_RUN}   SKIP_GOOGLE: ${SKIP_GOOGLE}   LIMIT: ${
      LIMIT || "none"
    }`
  );

  const connection = await getConnection();

  try {
    // Select places with google_place_id and missing city_id
    const limitClause = LIMIT ? `LIMIT ${LIMIT}` : "";

    const [places] = await connection.query(`
      SELECT p.id, p.google_place_id, p.name, p.address
      FROM places p
      WHERE p.city_id IS NULL AND p.google_place_id IS NOT NULL
      ORDER BY p.id
      ${limitClause}
    `);

    console.log(`Found ${places.length} places to process`);

    let updated = 0;
    let skippedNoInfo = 0;
    let errors = 0;

    for (const place of places) {
      try {
        console.log(
          `\nProcessing place: ${place.name} (${place.id}) - ${place.google_place_id}`
        );

        let cityName = null;
        let countryName = null;
        let googleCityPlaceId = null;

        if (!SKIP_GOOGLE) {
          // Fetch place details from Google Maps
          try {
            const placeDetails = await getPlaceDetailsWithPhotos(
              place.google_place_id
            );
            const extracted = await extractCityCountryFromPlaceDetails(
              placeDetails
            );
            cityName = extracted.city;
            countryName = extracted.country;

            // If the placeDetails itself corresponds to a city, capture its place id
            if (
              placeDetails &&
              placeDetails.types &&
              placeDetails.types.includes("locality") &&
              placeDetails.place_id
            ) {
              googleCityPlaceId = placeDetails.place_id;
            }

            console.log(
              `  → Resolved city: ${cityName || "N/A"}, country: ${
                countryName || "N/A"
              }`
            );
          } catch (err) {
            console.warn(
              `  ⚠️ Google Maps lookup failed for ${place.google_place_id}: ${err.message}`
            );
          }
        } else {
          // Try to extract from address locally
          if (place.address) {
            const parts = place.address
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            // pick likely candidate near end
            cityName = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
            console.log(`  → Local address inference city: ${cityName}`);
          }
        }

        if (!cityName && !countryName) {
          console.log("  ✗ Could not determine city/country, skipping");
          skippedNoInfo++;
          continue;
        }

        // Upsert country and city
        const { city, country } = await upsertCountryAndCity(
          connection,
          cityName,
          countryName,
          googleCityPlaceId
        );

        if (!city) {
          console.log("  ✗ City could not be created/found, skipping");
          skippedNoInfo++;
          continue;
        }

        // Update place's city_id
        if (DRY_RUN) {
          console.log(
            `  (DRY RUN) Would update place ${place.id} -> city_id = ${city.id}`
          );
          updated++;
        } else {
          await connection.query(
            "UPDATE places SET city_id = ?, updated_at = NOW() WHERE id = ?",
            [city.id, place.id]
          );
          console.log(`  ✅ Updated place ${place.id} with city_id ${city.id}`);
          updated++;
        }
      } catch (err) {
        console.error(`  ✗ Error processing place ${place.id}:`, err.message);
        errors++;
      }
    }

    console.log("\n📊 SUMMARY");
    console.log("==========");
    console.log(`Processed: ${places.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped (no info): ${skippedNoInfo}`);
    console.log(`Errors: ${errors}`);

    if (DRY_RUN)
      console.log("\nNote: This was a dry run. No DB rows were changed.");
  } catch (err) {
    console.error("Fatal error:", err.message);
    process.exitCode = 1;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
