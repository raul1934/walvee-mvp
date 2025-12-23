const path = require("path");
// Load .env from project root if available
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}
const DRY_RUN = process.argv.includes("--dry-run");
const cliDbUser = getArg("--db-user");
const cliDbPassword = getArg("--db-password");
const cliDbHost = getArg("--db-host");
const cliDbName = getArg("--db-name");
const cliDbPort = getArg("--db-port");
if (cliDbUser) process.env.DB_USER = cliDbUser;
if (cliDbPassword) process.env.DB_PASSWORD = cliDbPassword;
if (cliDbHost) process.env.DB_HOST = cliDbHost;
if (cliDbName) process.env.DB_NAME = cliDbName;
if (cliDbPort) process.env.DB_PORT = cliDbPort;

if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
  console.warn(
    "[update-trip-cities-old-ids] DB credentials not fully set in env; you can pass --db-user and --db-password to override"
  );
}

const { Trip } = require("../src/models/sequelize");

async function remapOldCityIds() {
  console.log(
    "Starting update of numeric/old city_id values in trip_cities -> mapping by city position (created_at asc).\n"
  );

  try {
    // Find candidate rows where city_id looks numeric (no hyphen and all digits)
    const [candidates] = await Trip.sequelize.query(
      `SELECT id, trip_id, city_id FROM trip_cities WHERE city_id RLIKE '^[0-9]+$'`
    );

    console.log(
      `Found ${candidates.length} trip_cities rows with numeric city_id`
    );

    // Ensure collation of trip_cities.city_id matches cities.id to avoid "Illegal mix of collations" errors
    try {
      const [[tripCitiesInfo]] = await Trip.sequelize.query(
        `SELECT COLLATION_NAME as coll FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'trip_cities' AND COLUMN_NAME = 'city_id'`
      );
      const [[citiesInfo]] = await Trip.sequelize.query(
        `SELECT COLLATION_NAME as coll FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cities' AND COLUMN_NAME = 'id'`
      );

      const tripColl = tripCitiesInfo && tripCitiesInfo.coll;
      const citiesColl = citiesInfo && citiesInfo.coll;

      if (tripColl && citiesColl && tripColl !== citiesColl) {
        if (DRY_RUN) {
          console.log(
            `DRY RUN: would change trip_cities.city_id collation from ${tripColl} -> ${citiesColl}`
          );
        } else {
          console.log(
            `Changing trip_cities.city_id collation from ${tripColl} -> ${citiesColl}`
          );
          await Trip.sequelize.query(
            `ALTER TABLE trip_cities MODIFY COLUMN city_id CHAR(36) COLLATE ${citiesColl} ${
              tripCitiesInfo && tripCitiesInfo.IS_NULLABLE === "YES"
                ? "NULL"
                : "NOT NULL"
            }`
          );
          console.log("Changed trip_cities.city_id collation");
        }
      }
    } catch (e) {
      console.warn(
        "Could not compare/modify collations:",
        e && e.message ? e.message : e
      );
    }

    if (candidates.length === 0) return;

    // Ensure trip_cities.city_id column can hold UUIDs (CHAR(36)). If it is still an INT,
    // alter the column type. We try to drop and re-add FK constraints around the change.
    const qi = Trip.sequelize.getQueryInterface();
    try {
      const desc = await qi.describeTable("trip_cities");
      const cityCol = desc["city_id"];
      if (cityCol && cityCol.type && /int/i.test(cityCol.type)) {
        if (DRY_RUN) {
          console.log(
            "DRY RUN: would ALTER TABLE trip_cities MODIFY city_id to CHAR(36) (and drop/recreate FK if needed)"
          );
        } else {
          // Attempt to drop common FK names; ignore errors
          for (const fkName of ["trip_cities_ibfk_2", "fk_trip_cities_city"]) {
            try {
              await Trip.sequelize.query(
                `ALTER TABLE trip_cities DROP FOREIGN KEY ${fkName}`
              );
              console.log(`Dropped foreign key ${fkName}`);
            } catch (e) {}
          }

          // Modify column type and align collation with cities.id
          const nullClause = cityCol.allowNull ? " NULL" : " NOT NULL";

          // Get cities.id collation
          let targetCollation = null;
          try {
            const [[colInfo]] = await Trip.sequelize.query(
              `SELECT COLLATION_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cities' AND COLUMN_NAME = 'id'`
            );
            targetCollation =
              colInfo && colInfo.COLLATION_NAME ? colInfo.COLLATION_NAME : null;
          } catch (e) {
            console.warn("Could not read cities.id collation:", e.message || e);
          }

          const collateClause = targetCollation
            ? ` COLLATE ${targetCollation}`
            : "";
          await Trip.sequelize.query(
            `ALTER TABLE trip_cities MODIFY COLUMN city_id CHAR(36)${collateClause}${nullClause}`
          );
          console.log(
            `Modified trip_cities.city_id to CHAR(36)${collateClause}`
          );

          // Re-add FK constraint to cities.id. Ignore if it already exists.
          try {
            await Trip.sequelize.query(
              `ALTER TABLE trip_cities ADD CONSTRAINT fk_trip_cities_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE`
            );
            console.log("Added FK fk_trip_cities_city -> cities(id)");
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn(
        "Could not inspect/modify trip_cities.city_id column:",
        e.message || e
      );
    }

    let processed = 0;
    let skipped = 0;
    for (const row of candidates) {
      const oldNum = parseInt(row.city_id, 10);
      if (!Number.isFinite(oldNum) || oldNum <= 0) {
        skipped++;
        continue;
      }

      // Find the city that corresponds to the old numeric index: nth city ordered by created_at asc
      const offset = oldNum - 1;
      const [[cityRow]] = await Trip.sequelize.query(
        `SELECT id FROM cities ORDER BY created_at ASC LIMIT 1 OFFSET ?`,
        { replacements: [offset] }
      );

      if (!cityRow || !cityRow.id) {
        console.warn(
          `  -> No city found for old index ${oldNum} (trip_cities.id=${row.id}), skipping`
        );
        skipped++;
        continue;
      }

      const newCityId = cityRow.id;

      if (DRY_RUN) {
        console.log(
          `DRY RUN: would update trip_cities.id=${row.id} (trip=${row.trip_id}) city_id: ${row.city_id} -> ${newCityId}`
        );
      } else {
        await Trip.sequelize.query(
          `UPDATE trip_cities SET city_id = ? WHERE id = ?`,
          { replacements: [newCityId, row.id] }
        );
        console.log(
          `Updated trip_cities.id=${row.id} city_id ${row.city_id} -> ${newCityId}`
        );
      }
      processed++;
    }

    console.log(
      `\nComplete. Processed: ${processed}, Skipped: ${skipped} (dryRun=${DRY_RUN})`
    );
  } catch (err) {
    console.error("Error updating trip_cities:", err.message || err);
    process.exit(1);
  }
}

remapOldCityIds()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
