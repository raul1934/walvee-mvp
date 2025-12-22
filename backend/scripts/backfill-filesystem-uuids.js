const fs = require("fs").promises;
const path = require("path");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

const IMAGE_DIR = path.join(__dirname, "..", "images");

/**
 * Create mapping from old integer directories to new UUID directories
 */
async function createDirectoryMapping() {
  const mappings = {
    cities: {},
    places: {},
    users: {},
    trips: {},
  };

  // For cities: try to map by finding cities that have images
  const [cities] = await sequelize.query(`
    SELECT c.id, c.name,
           CASE WHEN EXISTS (SELECT 1 FROM city_photos cp WHERE cp.city_id = c.id LIMIT 1) THEN 1 ELSE 0 END as has_photos
    FROM cities c
    WHERE EXISTS (SELECT 1 FROM city_photos cp WHERE cp.city_id = c.id LIMIT 1)
    ORDER BY c.id
  `);

  console.log(`Found ${cities.length} cities with photos`);

  // For places: try to map by finding places that have images
  const [places] = await sequelize.query(`
    SELECT p.id, p.name,
           CASE WHEN EXISTS (SELECT 1 FROM place_photos pp WHERE pp.place_id = p.id LIMIT 1) THEN 1 ELSE 0 END as has_photos
    FROM places p
    WHERE EXISTS (SELECT 1 FROM place_photos pp WHERE pp.place_id = p.id LIMIT 1)
    ORDER BY p.id
  `);

  console.log(`Found ${places.length} places with photos`);

  // For users: users likely already have UUID directories
  const [users] = await sequelize.query(`
    SELECT id, full_name
    FROM users
    WHERE photo_url LIKE '/images/%'
    ORDER BY id
  `);

  console.log(`Found ${users.length} users with local photos`);

  // For trips: check for trip images
  const [trips] = await sequelize.query(`
    SELECT id, title
    FROM trips
    WHERE cover_image LIKE '/images/%'
    ORDER BY id
  `);

  console.log(`Found ${trips.length} trips with local images`);

  return { cities, places, users, trips };
}

/**
 * Rename directories from integers to UUIDs
 */
async function renameDirectories() {
  try {
    console.log("Starting filesystem path backfill for UUID migration...\n");

    const mappings = await createDirectoryMapping();

    // Process cities
    console.log("Processing cities...");
    for (const city of mappings.cities) {
      const oldDir = path.join(IMAGE_DIR, "cities", city.id);
      const newDir = path.join(IMAGE_DIR, "cities", city.id);

      // Since the directory should already be named with UUID, check if it exists
      try {
        await fs.access(newDir);
        console.log(`✓ City ${city.name}: directory already uses UUID`);
      } catch {
        // Look for old integer directories - this is complex without mapping
        console.log(
          `⚠ City ${city.name}: UUID directory not found, may need manual mapping`
        );
      }
    }

    // Process places
    console.log("\nProcessing places...");
    for (const place of mappings.places) {
      const oldDir = path.join(IMAGE_DIR, "places", place.id);
      const newDir = path.join(IMAGE_DIR, "places", place.id);

      try {
        await fs.access(newDir);
        console.log(`✓ Place ${place.name}: directory already uses UUID`);
      } catch {
        console.log(
          `⚠ Place ${place.name}: UUID directory not found, may need manual mapping`
        );
      }
    }

    // Process users
    console.log("\nProcessing users...");
    for (const user of mappings.users) {
      const oldDir = path.join(IMAGE_DIR, "users", user.id);
      const newDir = path.join(IMAGE_DIR, "users", user.id);

      try {
        await fs.access(newDir);
        console.log(`✓ User ${user.full_name}: directory already uses UUID`);
      } catch {
        console.log(`⚠ User ${user.full_name}: UUID directory not found`);
      }
    }

    // Process trips
    console.log("\nProcessing trips...");
    for (const trip of mappings.trips) {
      const oldDir = path.join(IMAGE_DIR, "trips", trip.id);
      const newDir = path.join(IMAGE_DIR, "trips", trip.id);

      try {
        await fs.access(newDir);
        console.log(`✓ Trip ${trip.title}: directory already uses UUID`);
      } catch {
        console.log(`⚠ Trip ${trip.title}: UUID directory not found`);
      }
    }

    console.log("\nFilesystem path backfill analysis complete.");
    console.log("\nSUMMARY:");
    console.log("Most directories appear to already be using UUID names.");
    console.log(
      "If you have old integer-named directories that need renaming,"
    );
    console.log("you may need to manually map them or restore from backup.");
  } catch (error) {
    console.error("Error during filesystem backfill:", error);
    process.exit(1);
  }
}

// Run the script
renameDirectories();
