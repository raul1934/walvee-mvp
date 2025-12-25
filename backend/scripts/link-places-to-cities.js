const { getConnection } = require("../src/database/connection");

/**
 * Script to link places to cities by matching place names with city names
 * This finds places without a city_id and tries to match them to existing cities
 */

async function linkPlacesToCities() {
  console.log("\n🔗 LINKING PLACES TO CITIES");
  console.log("===========================\n");

  const connection = await getConnection();

  const DRY_RUN = !!process.env.DRY_RUN;
  if (DRY_RUN)
    console.log(
      "\n⚠️  Running in DRY_RUN mode — no DB writes will be performed\n"
    );

  try {
    // Get places without city_id
    const [placesWithoutCity] = await connection.query(`
      SELECT p.id, p.name, p.address, p.google_place_id
      FROM places p
      WHERE p.city_id IS NULL
      ORDER BY p.id
    `);

    console.log(`Found ${placesWithoutCity.length} places without city_id\n`);

    if (placesWithoutCity.length === 0) {
      console.log("✅ All places are already linked to cities!");
      return;
    }

    // Get all cities for matching
    const [cities] = await connection.query(`
      SELECT c.id, c.name, c.state, co.name as country_name, co.code as country_code
      FROM cities c
      LEFT JOIN countries co ON c.country_id = co.id
    `);

    console.log(`Loaded ${cities.length} cities for matching\n`);

    let matched = 0;
    let unmatched = 0;

    for (const place of placesWithoutCity) {
      let cityMatch = null;

      // Try to extract city name from address
      if (place.address) {
        const addressParts = place.address.split(",").map((s) => s.trim());

        // Try to find city in address (usually second to last or third to last part)
        for (let i = 0; i < addressParts.length && !cityMatch; i++) {
          const addressPart = addressParts[i];

          // Try exact match
          cityMatch = cities.find(
            (c) => c.name.toLowerCase() === addressPart.toLowerCase()
          );

          // Try partial match
          if (!cityMatch) {
            cityMatch = cities.find(
              (c) =>
                addressPart.toLowerCase().includes(c.name.toLowerCase()) ||
                c.name.toLowerCase().includes(addressPart.toLowerCase())
            );
          }
        }
      }

      // If no match from address, try matching place name with city name
      if (!cityMatch) {
        // Check if place name contains a city name
        const placeLower = place.name.toLowerCase();
        cityMatch = cities.find(
          (c) =>
            placeLower.includes(c.name.toLowerCase()) ||
            c.name.toLowerCase().includes(placeLower)
        );
      }

      if (cityMatch) {
        console.log(
          `✓ Matched: "${place.name}" → ${cityMatch.name}, ${cityMatch.country_name}`
        );

        // Update the place with city_id
        if (DRY_RUN) {
          console.log(
            `  (DRY RUN) Would update place ${place.id} -> city_id = ${cityMatch.id}`
          );
        } else {
          await connection.query("UPDATE places SET city_id = ? WHERE id = ?", [
            cityMatch.id,
            place.id,
          ]);
        }

        place.matched = true; // Mark as matched
        matched++;
      } else {
        console.log(
          `✗ No match: "${place.name}" (${place.address || "no address"})`
        );
        place.matched = false; // Mark as unmatched
        unmatched++;
      }
    }

    // Try AI matching for unmatched places
    if (unmatched > 0) {
      console.log(
        "\n🤖 Attempting AI-based matching for remaining places...\n"
      );

      const unmatchedPlaces = placesWithoutCity.filter((place) => {
        // Check if this place was not matched yet
        return !place.matched;
      });

      for (const place of unmatchedPlaces) {
        try {
          // Step 1: Free-form AI inference
          const inferredCityName = await inferCityNameWithAI(place, cities);

          let matchedCity = null;

          if (inferredCityName) {
            // Try to match with existing cities first
            matchedCity = cities.find(
              (c) =>
                c.name.toLowerCase() === inferredCityName.toLowerCase() ||
                inferredCityName.toLowerCase().includes(c.name.toLowerCase()) ||
                c.name.toLowerCase().includes(inferredCityName.toLowerCase())
            );

            if (matchedCity) {
              console.log(
                `✓ AI Matched (free-form): "${place.name}" → ${matchedCity.name}, ${matchedCity.country_name}`
              );
            } else {
              console.log(
                `🔍 AI free-form inferred city "${inferredCityName}" for "${place.name}" but no exact DB match found`
              );
            }
          }

          // Step 2: If free-form didn't match, ask AI to choose from candidate list
          if (!matchedCity) {
            const candidateMatch = await inferCityFromCandidates(place, cities);
            if (candidateMatch) {
              matchedCity = candidateMatch;
              console.log(
                `✓ AI Candidate Picked: "${place.name}" → ${matchedCity.name}, ${matchedCity.country_name}`
              );
            }
          }

          if (matchedCity) {
            if (DRY_RUN) {
              console.log(
                `  (DRY RUN) Would update place ${place.id} -> city_id = ${matchedCity.id}`
              );
            } else {
              await connection.query(
                "UPDATE places SET city_id = ? WHERE id = ?",
                [matchedCity.id, place.id]
              );
            }

            matched++;
            unmatched--;
            place.matched = true;
          } else if (inferredCityName) {
            // Keep free-form inferred city for later Google Maps lookup
            place.inferredCityName = inferredCityName;
          }
        } catch (error) {
          console.error(
            `✗ AI inference failed for "${place.name}":`,
            error.message
          );
        }
      }
    }

    // Try Google Maps to create missing cities
    if (unmatched > 0) {
      console.log(
        "\n🗺️  Fetching city info from Google Maps for remaining places...\n"
      );

      const stillUnmatched = placesWithoutCity.filter(
        (place) => !place.matched
      );

      for (const place of stillUnmatched) {
        try {
          // Use AI-inferred city name if available for better Google Maps search
          const cityCreated = await fetchAndCreateCityFromGoogleMaps(
            place,
            connection,
            place.inferredCityName
          );

          if (cityCreated) {
            console.log(
              `✓ Created city and linked: "${place.name}" → ${cityCreated.cityName}`
            );
            matched++;
            unmatched--;
            continue; // proceed to next place
          }

          // Aggressive fallback: perform a text search by place name to find alternate place_id
          const ag = await aggressiveGoogleTextSearch(place, connection);
          if (ag && ag.cityId) {
            console.log(
              `✓ Aggressive Google text-search linked: "${place.name}" → ${ag.cityName}`
            );
            matched++;
            unmatched--;
            continue;
          }
        } catch (error) {
          console.error(
            `✗ Google Maps fetch failed for "${place.name}":`,
            error.message
          );
        }
      }
    }

    console.log("\n📊 RESULTS");
    console.log("==========");
    console.log(`Total places processed: ${placesWithoutCity.length}`);
    console.log(`Successfully matched: ${matched}`);
    console.log(`No match found: ${unmatched}`);

    if (unmatched > 0) {
      console.log("\n⚠️  Some places could not be matched automatically.");
      console.log(
        "   You may need to manually link them or add the cities to the database."
      );
    }
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    connection.release();
  }
}

/**
 * Use AI (Gemini) to determine the city name for a place
 * @param {Object} place - Place object with name and address
 * @param {Array} cities - Array of city objects (used for context)
 * @returns {string|null} - City name or null
 */
async function inferCityNameWithAI(place, cities) {
  const axios = require("axios");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("⚠️  GEMINI_API_KEY not found, skipping AI inference");
    return null;
  }

  const prompt = `Analyze this place and determine which city it is located in.

Place Name: ${place.name}
Place Address: ${place.address || "N/A"}

Instructions:
1. Based on the place name and address, determine the city name
2. Return ONLY the city name (e.g., "Tokyo", "Paris", "New York")
3. If you cannot determine the city, return "UNKNOWN"
4. Do not include any explanation, country, or additional text

City name:`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 20,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const cityName = response.data.candidates[0].content.parts[0].text.trim();

    if (cityName === "UNKNOWN" || !cityName) {
      return null;
    }

    return cityName;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.log(`  ⏱️  Timeout for "${place.name}"`);
    }
    return null;
  }
}

/**
 * Use AI to choose from a list of candidate cities
 * Returns the chosen city object from the cities array or null
 */
async function inferCityFromCandidates(place, cities) {
  const axios = require("axios");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log(
      "⚠️  GEMINI_API_KEY not found, skipping candidate AI inference"
    );
    return null;
  }

  // Limit candidate list to top 50 to keep prompt size reasonable
  const candidates = cities.slice(0, 50).map((c, i) => ({
    idx: i + 1,
    name: c.name,
    country: c.country_name || "",
  }));

  const candidateListStr = candidates
    .map((c) => `${c.idx}. ${c.name}${c.country ? `, ${c.country}` : ""}`)
    .join("\n");

  const prompt = `You are given a place name and address and a numbered list of candidate cities.
Return the NUMBER of the best matching city from the list, or the word NONE if no good match.

Place Name: ${place.name}
Place Address: ${place.address || "N/A"}

Candidates:
${candidateListStr}

Answer with ONLY the number or NONE.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 10,
        },
      },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 }
    );

    const raw = response.data.candidates[0].content.parts[0].text.trim();
    const choice = raw.split(/\s|\n/)[0];

    if (!choice || choice.toUpperCase() === "NONE") return null;

    const idx = parseInt(choice, 10);
    if (Number.isInteger(idx) && idx >= 1 && idx <= candidates.length) {
      const chosen = candidates.find((c) => c.idx === idx);
      return cities[idx - 1] || null;
    }

    return null;
  } catch (err) {
    console.log(
      `  ⚠️ Candidate AI inference failed for "${place.name}": ${err.message}`
    );
    return null;
  }
}

/**
 * Fetch city information from Google Maps and create it in the database
 * @param {Object} place - Place object
 * @param {Object} connection - Database connection
 * @param {string} inferredCityName - Optional city name inferred by AI
 * @returns {Object|null} - Created city info or null
 */
async function fetchAndCreateCityFromGoogleMaps(
  place,
  connection,
  inferredCityName = null
) {
  const axios = require("axios");
  const {
    getPlaceDetailsWithPhotos,
    getCityDetailsWithPhotos,
  } = require("../src/services/googleMapsService");

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.log(
      "⚠️  GOOGLE_MAPS_API_KEY not found, skipping Google Maps fetch"
    );
    return null;
  }

  try {
    let cityName = null;
    let stateName = null;
    let countryName = null;
    let countryCode = null;
    let cityLat = null;
    let cityLng = null;
    let googleMapsId = null;

    // If AI inferred a city name, try to find it on Google Maps first
    if (inferredCityName) {
      console.log(
        `  🔍 Searching Google Maps for AI-inferred city: "${inferredCityName}"`
      );

      try {
        // Search for the city on Google Maps
        const searchResponse = await axios.get(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`,
          {
            params: {
              input: inferredCityName,
              inputtype: "textquery",
              fields: "place_id,name,geometry",
              key: apiKey,
            },
          }
        );

        if (
          searchResponse.data.candidates &&
          searchResponse.data.candidates.length > 0
        ) {
          const cityPlaceId = searchResponse.data.candidates[0].place_id;
          console.log(`  ✓ Found city on Google Maps: ${cityPlaceId}`);

          // Get detailed city info
          const cityDetails = await getCityDetailsWithPhotos(cityPlaceId);

          if (cityDetails && cityDetails.address_components) {
            googleMapsId = cityPlaceId;
            cityLat = cityDetails.geometry?.location?.lat;
            cityLng = cityDetails.geometry?.location?.lng;

            // Extract city and country from city details
            for (const component of cityDetails.address_components) {
              if (component.types.includes("locality")) {
                cityName = component.long_name;
              }
              if (component.types.includes("administrative_area_level_1")) {
                stateName = component.long_name;
              }
              if (component.types.includes("country")) {
                countryName = component.long_name;
                countryCode = component.short_name;
              }
            }
          }
        }
      } catch (error) {
        console.log(
          `  ⚠️  Could not fetch AI-inferred city from Google Maps: ${error.message}`
        );
      }
    }

    // Fallback: Get place details to extract city info
    if (!cityName) {
      console.log(`  📍 Fetching place details from Google Maps...`);
      const placeDetails = await getPlaceDetailsWithPhotos(
        place.google_place_id
      );

      if (!placeDetails || !placeDetails.address_components) {
        console.log(`  ⚠️  No address components for "${place.name}"`);
        return null;
      }

      // Extract city and country from address components
      for (const component of placeDetails.address_components) {
        if (component.types.includes("locality")) {
          cityName = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1")) {
          stateName = component.long_name;
        }
        if (component.types.includes("country")) {
          countryName = component.long_name;
          countryCode = component.short_name;
        }
      }

      cityLat = placeDetails.geometry?.location?.lat;
      cityLng = placeDetails.geometry?.location?.lng;
    }

    if (!cityName || !countryName) {
      console.log(`  ⚠️  Could not extract city/country for "${place.name}"`);
      return null;
    }

    console.log(`  📍 Found: ${cityName}, ${countryName}`);

    // Check if country exists, if not create it
    let [countries] = await connection.query(
      "SELECT id FROM countries WHERE code = ? OR name = ?",
      [countryCode, countryName]
    );

    const { generateUUID } = require("../src/utils/helpers");
    let countryId;
    if (countries.length === 0) {
      console.log(`  ➕ Creating country: ${countryName}`);
      countryId = generateUUID();
      if (DRY_RUN) {
        console.log(
          `  (DRY RUN) Would INSERT country ${countryName} (${countryId})`
        );
      } else {
        await connection.query(
          "INSERT INTO countries (id, name, code, created_at) VALUES (?, ?, ?, NOW())",
          [countryId, countryName, countryCode]
        );
      }
    } else {
      countryId = countries[0].id;
    }

    // Check if city already exists
    let [existingCities] = await connection.query(
      "SELECT id FROM cities WHERE name = ? AND country_id = ?",
      [cityName, countryId]
    );

    let cityId;
    if (existingCities.length === 0) {
      console.log(`  ➕ Creating city: ${cityName}`);
      cityId = generateUUID();
      if (DRY_RUN) {
        console.log(`  (DRY RUN) Would INSERT city ${cityName} (${cityId})`);
      } else {
        await connection.query(
          "INSERT INTO cities (id, name, state, country_id, latitude, longitude, google_maps_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
          [
            cityId,
            cityName,
            stateName,
            countryId,
            cityLat,
            cityLng,
            googleMapsId,
          ]
        );
      }
    } else {
      cityId = existingCities[0].id;
      console.log(`  ✓ City already exists: ${cityName}`);
    }

    // Link place to city
    if (DRY_RUN) {
      console.log(
        `  (DRY RUN) Would update place ${place.id} -> city_id = ${cityId}`
      );
    } else {
      await connection.query("UPDATE places SET city_id = ? WHERE id = ?", [
        cityId,
        place.id,
      ]);
    }

    return { cityName, countryName, cityId };
  } catch (error) {
    console.error(`  ✗ Error fetching from Google Maps:`, error.message);
    return null;
  }
}

/**
 * Aggressive fallback: search Google Places by text (name + address) to find a candidate
 * and link the place to that candidate's locality
 */
async function aggressiveGoogleTextSearch(place, connection) {
  try {
    const {
      searchPlace,
      getPlaceDetailsWithPhotos,
    } = require("../src/services/googleMapsService");

    const query = place.address
      ? `${place.name}, ${place.address}`
      : place.name;
    console.log(`  🔎 Aggressive Google search for: "${query}"`);

    const candidate = await searchPlace(query);
    if (!candidate || !candidate.place_id) {
      console.log(`    ⚠️ No candidate found for "${place.name}"`);
      return null;
    }

    // Fetch full details for candidate
    const details = await getPlaceDetailsWithPhotos(candidate.place_id);
    if (!details || !details.address_components) {
      console.log(
        `    ⚠️ Candidate has no address components (${candidate.place_id})`
      );
      return null;
    }

    // Extract city and country
    let cityName = null;
    let countryName = null;
    let googleCityPlaceId = null;
    for (const comp of details.address_components) {
      if (
        !cityName &&
        (comp.types.includes("locality") ||
          comp.types.includes("postal_town") ||
          comp.types.includes("administrative_area_level_2"))
      ) {
        cityName = comp.long_name;
      }
      if (!countryName && comp.types.includes("country")) {
        countryName = comp.long_name;
      }
    }
    if (
      details.types &&
      details.types.includes("locality") &&
      details.place_id
    ) {
      googleCityPlaceId = details.place_id;
    }

    if (!cityName || !countryName) {
      console.log(
        `    ⚠️ Could not extract city/country from candidate for "${place.name}"`
      );
      return null;
    }

    // Upsert country and city and link place (reusing same logic as fetchAndCreateCityFromGoogleMaps)
    const { generateUUID } = require("../src/utils/helpers");

    // Country
    let [countries] = await connection.query(
      "SELECT id FROM countries WHERE code = ? OR name = ?",
      [details.country_code || null, countryName]
    );

    let countryId;
    if (countries.length === 0) {
      countryId = generateUUID();
      if (DRY_RUN) {
        console.log(
          `    (DRY RUN) Would INSERT country ${countryName} (${countryId})`
        );
      } else {
        await connection.query(
          "INSERT INTO countries (id, name, code, created_at) VALUES (?, ?, ?, NOW())",
          [countryId, countryName, details.country_code || null]
        );
      }
    } else {
      countryId = countries[0].id;
    }

    // City
    let [existingCities] = await connection.query(
      "SELECT id FROM cities WHERE name = ? AND country_id = ?",
      [cityName, countryId]
    );

    let cityId;
    if (existingCities.length === 0) {
      cityId = generateUUID();
      if (DRY_RUN) {
        console.log(`    (DRY RUN) Would INSERT city ${cityName} (${cityId})`);
      } else {
        await connection.query(
          "INSERT INTO cities (id, name, state, country_id, latitude, longitude, google_maps_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
          [
            cityId,
            cityName,
            details.state || null,
            countryId,
            details.geometry?.location?.lat || null,
            details.geometry?.location?.lng || null,
            googleCityPlaceId,
          ]
        );
      }
    } else {
      cityId = existingCities[0].id;
    }

    // Link place to city
    if (DRY_RUN) {
      console.log(
        `    (DRY RUN) Would update place ${place.id} -> city_id = ${cityId}`
      );
    } else {
      await connection.query("UPDATE places SET city_id = ? WHERE id = ?", [
        cityId,
        place.id,
      ]);
    }

    return { cityId, cityName };
  } catch (err) {
    console.error(
      `    ✗ Aggressive search failed for "${place.name}":`,
      err.message
    );
    return null;
  }
}

// Run the script
linkPlacesToCities().then(() => {
  console.log("\n✅ Script completed!");
  process.exit(0);
});
