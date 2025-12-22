const { Trip, City, Country } = require("../src/models/sequelize");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const DRY_RUN = process.argv.includes("--dry-run");

// Simple Levenshtein distance implementation (small, dependency-free)
function levenshtein(a, b) {
  if (!a || !b) return Math.max(a?.length || 0, b?.length || 0);
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return 1 - dist / maxLen;
}

/**
 * Backfill trip_cities join table using heuristics:
 * - If trip.destination_city_id is set and no trip_cities row exists, insert it (city_order = 0)
 * - For trips without trip_cities, try to match destination string to City and insert
 */
async function backfillTripCities() {
  console.log("Starting backfill of trip_cities table...\n");

  try {
    // Load cities and countries for matching
    const cities = await City.findAll({
      attributes: ["id", "name", "state", "country_id"],
    });
    const countries = await Country.findAll({
      attributes: ["id", "name", "code"],
    });
    const countryById = new Map(countries.map((c) => [c.id, c]));

    // 1) Ensure any trips with destination_city_id have a trip_cities row
    const tripsWithDest = await Trip.findAll({
      where: { destination_city_id: { [Op.ne]: null } },
      attributes: ["id", "destination_city_id"],
    });

    let inserted = 0;
    for (const t of tripsWithDest) {
      const [[exists]] = await Trip.sequelize.query(
        "SELECT 1 FROM trip_cities WHERE trip_id = ? AND city_id = ? LIMIT 1",
        { replacements: [t.id, t.destination_city_id] }
      );
      if (!exists) {
        await Trip.sequelize.query(
          "INSERT INTO trip_cities (id, trip_id, city_id, city_order, created_at) VALUES (?, ?, ?, 0, NOW())",
          { replacements: [uuidv4(), t.id, t.destination_city_id] }
        );
        inserted++;
      }
    }
    console.log(`Inserted ${inserted} rows from destination_city_id`);

    // 2) Attempt to match trips without any trip_cities using destination string
    const [rows] = await Trip.sequelize.query(
      `SELECT t.id, t.destination, t.title FROM trips t WHERE NOT EXISTS (SELECT 1 FROM trip_cities tc WHERE tc.trip_id = t.id) AND t.destination IS NOT NULL`
    );

    let matched = 0;
    let unmatched = [];

    for (const trip of rows) {
      const destination = (trip.destination || "").trim();
      if (!destination) {
        unmatched.push({ id: trip.id, destination, reason: "empty" });
        continue;
      }

      const parts = destination
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      const cityName = parts[0] || "";
      const countryPart = parts.length > 1 ? parts[parts.length - 1] : null;
      console.log(
        `Trip ${trip.id}: parsed cityName='${cityName}' country='${
          countryPart || ""
        }'`
      );

      let matchedCity = null;

      // 1) Exact name + country if present
      if (countryPart) {
        // find country by name or code (case-insensitive)
        const country = countries.find(
          (co) =>
            co.name.toLowerCase() === countryPart.toLowerCase() ||
            co.code.toLowerCase() === countryPart.toLowerCase()
        );
        if (country) {
          matchedCity = cities.find(
            (c) =>
              c.name.toLowerCase() === cityName.toLowerCase() &&
              c.country_id === country.id
          );
          if (matchedCity) matchMethod = `exact+country(${country.name})`;
        }
      }

      // 2) Exact name match
      if (!matchedCity) {
        matchedCity = cities.find(
          (c) => c.name.toLowerCase() === cityName.toLowerCase()
        );
        if (matchedCity) matchMethod = "exact";
      }

      // 3) Substring match
      if (!matchedCity) {
        matchedCity = cities.find(
          (c) =>
            c.name.toLowerCase().includes(cityName.toLowerCase()) ||
            cityName.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matchedCity) matchMethod = "substring";
      }

      // 4) Fuzzy match using Levenshtein similarity (threshold 0.75), prioritize same-country if countryPart known
      if (!matchedCity && cityName) {
        let candidates = cities;
        if (countryPart) {
          const country = countries.find(
            (co) =>
              co.name.toLowerCase() === countryPart.toLowerCase() ||
              co.code.toLowerCase() === countryPart.toLowerCase()
          );
          if (country)
            candidates = cities.filter((c) => c.country_id === country.id);
        }
        let best = null;
        let bestScore = 0;
        for (const c of candidates) {
          const score = similarity(cityName, c.name);
          if (score > bestScore) {
            best = c;
            bestScore = score;
          }
        }
        if (best && bestScore >= 0.75) {
          matchedCity = best;
          matchMethod = `fuzzy(${bestScore.toFixed(2)})`;
        } else if (best) {
          console.log(
            `  best fuzzy candidate: ${best.name} (score=${bestScore.toFixed(
              2
            )}) — below threshold`
          );
        }
      }

      if (matchedCity) {
        if (DRY_RUN) {
          console.log(
            `DRY RUN: would insert ${trip.id} -> ${matchedCity.id} (${matchedCity.name})`
          );
        } else {
          await Trip.sequelize.query(
            "INSERT INTO trip_cities (id, trip_id, city_id, city_order, created_at) VALUES (?, ?, ?, 0, NOW())",
            { replacements: [uuidv4(), trip.id, matchedCity.id] }
          );
        }
        matched++;
        console.log(
          `✓ Matched ${trip.destination} -> ${matchedCity.name} (ID: ${
            matchedCity.id
          }) via ${matchMethod || "unknown"}`
        );
      } else {
        unmatched.push({
          id: trip.id,
          destination: trip.destination,
          title: trip.title,
        });
      }
    }

    console.log(
      `\nSummary: inserted ${inserted} from destination_city_id, matched ${matched} by destination string, unmatched ${unmatched.length}`
    );
    if (unmatched.length > 0) {
      console.log(
        "Some trips could not be matched; consider manual review or extending heuristics."
      );
    }

    console.log("Backfill complete.");
  } catch (error) {
    console.error("Error in backfill-trip-cities:", error);
    process.exit(1);
  }
}

backfillTripCities()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
