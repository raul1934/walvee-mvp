/*
 * Migration helper script: migrate-user-cityid-to-uuid.js
 *
 * Usage:
 *  node migrate-user-cityid-to-uuid.js           # dry run: reports unmappable rows
 *  node migrate-user-cityid-to-uuid.js --apply   # performs ALTER TABLE to change column type
 *  node migrate-user-cityid-to-uuid.js --apply --force  # skip interactive prompt
 *
 * Behavior:
 *  - Dumps rows where users.city_id is present but not UUID to `migrations/output/unmapped_user_city_ids.csv`
 *  - If --apply is passed: alters `users.city_id` column to CHAR(36) NULL
 *  - Does NOT attempt automatic mapping of numeric ids to UUIDs (unsafe); instead logs unmapped rows for manual review.
 *
 * IMPORTANT: BACKUP your DB before running with --apply.
 */

const fs = require("fs");
const path = require("path");
const { sequelize } = require("../database/sequelize");

const OUTPUT_DIR = path.join(__dirname, "..", "migrations", "output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "unmapped_user_city_ids.csv");

function isUUIDRegex() {
  return "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";
}

async function main() {
  const args = process.argv.slice(2);
  const APPLY = args.includes("--apply");
  const FORCE = args.includes("--force");

  console.log("\nStarting user.city_id -> UUID migration helper");

  // Ensure output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Query suspicious rows: city_id not null and not UUID
  const uuidRegex = isUUIDRegex();
  const [results] = await sequelize.query(
    `SELECT id, city_id FROM users WHERE city_id IS NOT NULL AND NOT (CAST(city_id AS CHAR) RLIKE '${uuidRegex}');`
  );

  if (!results || results.length === 0) {
    console.log("No non-UUID city_id values found. Column appears clean.");
  } else {
    console.log(
      `Found ${results.length} users with non-UUID city_id values. Writing to ${OUTPUT_FILE}`
    );

    const csvLines = ["user_id,city_id"];
    results.forEach((r) => {
      csvLines.push(`${r.id},${r.city_id}`);
    });

    fs.writeFileSync(OUTPUT_FILE, csvLines.join("\n"));
    console.log(
      "Wrote unmapped rows. Please review the CSV and decide how to map or clear them."
    );
  }

  if (!APPLY) {
    console.log(
      "\nDry run complete. To actually modify the schema run with --apply. Exiting."
    );
    process.exit(0);
  }

  // Confirm
  if (!FORCE) {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      rl.question(
        "\nAbout to ALTER TABLE users MODIFY COLUMN city_id CHAR(36) NULL; this is destructive. Have you backed up the DB? (type YES to continue) ",
        (ans) => {
          rl.close();
          resolve(ans.trim());
        }
      );
    });

    if (answer !== "YES") {
      console.log("Abort: user did not confirm. Exiting.");
      process.exit(1);
    }
  }

  // Perform ALTER
  try {
    console.log("\nAltering users.city_id to CHAR(36) NULL...");
    await sequelize.query(
      "ALTER TABLE users MODIFY COLUMN city_id CHAR(36) NULL;"
    );
    console.log("Column altered successfully.");

    console.log(
      "\nOptional: If you want a foreign key constraint to cities(id), run:"
    );
    console.log(
      "ALTER TABLE users ADD CONSTRAINT fk_users_city FOREIGN KEY (city_id) REFERENCES cities(id);"
    );

    console.log(
      "\nMigration script completed. Please review the unmapped CSV and either map or clear those users.city_id values."
    );
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(2);
});
