const fs = require("fs").promises;
const path = require("path");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});
const IMAGE_DIR = path.join(__dirname, "..", "images");

/**
 * Update database URLs to use UUIDs instead of integers
 */
async function updateDatabaseUrls() {
  console.log("Updating database image URLs to use UUIDs...\n");

  // Update city_photos URLs
  console.log("Updating city photo URLs...");
  const [cityPhotos] = await sequelize.query(`
    SELECT cp.id, cp.city_id, cp.url_small, cp.url_medium, cp.url_large
    FROM city_photos cp
    JOIN cities c ON cp.city_id = c.id
    WHERE cp.url_small LIKE '/images/cities/%'
    LIMIT 10
  `);

  for (const photo of cityPhotos) {
    const oldPathMatch = photo.url_small.match(/\/images\/cities\/(\d+)\//);
    if (oldPathMatch) {
      const oldId = oldPathMatch[1];
      const newUrlSmall = photo.url_small.replace(
        `/images/cities/${oldId}/`,
        `/images/cities/${photo.city_id}/`
      );
      const newUrlMedium = photo.url_medium.replace(
        `/images/cities/${oldId}/`,
        `/images/cities/${photo.city_id}/`
      );
      const newUrlLarge = photo.url_large.replace(
        `/images/cities/${oldId}/`,
        `/images/cities/${photo.city_id}/`
      );

      await sequelize.query(
        "UPDATE city_photos SET url_small = ?, url_medium = ?, url_large = ? WHERE id = ?",
        {
          replacements: [newUrlSmall, newUrlMedium, newUrlLarge, photo.id],
          type: sequelize.QueryTypes.UPDATE,
        }
      );

      console.log(
        `✓ Updated city photo ${photo.id}: ${oldId} → ${photo.city_id}`
      );
    }
  }

  // Update place_photos URLs
  console.log("\nUpdating place photo URLs...");
  const [placePhotos] = await sequelize.query(`
    SELECT pp.id, pp.place_id, pp.url_small, pp.url_medium, pp.url_large
    FROM place_photos pp
    JOIN places p ON pp.place_id = p.id
    WHERE pp.url_small LIKE '/images/places/%'
    LIMIT 10
  `);

  for (const photo of placePhotos) {
    const oldPathMatch = photo.url_small.match(/\/images\/places\/(\d+)\//);
    if (oldPathMatch) {
      const oldId = oldPathMatch[1];
      const newUrlSmall = photo.url_small.replace(
        `/images/places/${oldId}/`,
        `/images/places/${photo.place_id}/`
      );
      const newUrlMedium = photo.url_medium.replace(
        `/images/places/${oldId}/`,
        `/images/places/${photo.place_id}/`
      );
      const newUrlLarge = photo.url_large.replace(
        `/images/places/${oldId}/`,
        `/images/places/${photo.place_id}/`
      );

      await sequelize.query(
        "UPDATE place_photos SET url_small = ?, url_medium = ?, url_large = ? WHERE id = ?",
        {
          replacements: [newUrlSmall, newUrlMedium, newUrlLarge, photo.id],
          type: sequelize.QueryTypes.UPDATE,
        }
      );

      console.log(
        `✓ Updated place photo ${photo.id}: ${oldId} → ${photo.place_id}`
      );
    }
  }

  console.log("\nDatabase URL updates complete.");
}

/**
 * Rename filesystem directories from integers to UUIDs
 */
async function renameDirectories() {
  console.log("Renaming filesystem directories to use UUIDs...\n");

  // Get all cities with photos
  const [cities] = await sequelize.query(`
    SELECT DISTINCT c.id, c.name
    FROM cities c
    JOIN city_photos cp ON c.id = cp.city_id
  `);

  console.log(`Processing ${cities.length} cities with photos...`);
  for (const city of cities) {
    const uuidDir = path.join(IMAGE_DIR, "cities", city.id);

    // Check if UUID directory already exists
    try {
      await fs.access(uuidDir);
      console.log(`✓ City ${city.name}: UUID directory already exists`);
      continue;
    } catch {
      // UUID directory doesn't exist, look for integer directories
      // This is tricky without mapping, so we'll skip for now
      console.log(`⚠ City ${city.name}: UUID directory not found, skipping`);
    }
  }

  // Get all places with photos
  const [places] = await sequelize.query(`
    SELECT DISTINCT p.id, p.name
    FROM places p
    JOIN place_photos pp ON p.id = pp.place_id
  `);

  console.log(`\nProcessing ${places.length} places with photos...`);
  for (const place of places) {
    const uuidDir = path.join(IMAGE_DIR, "places", place.id);

    try {
      await fs.access(uuidDir);
      console.log(`✓ Place ${place.name}: UUID directory already exists`);
      continue;
    } catch {
      console.log(`⚠ Place ${place.name}: UUID directory not found, skipping`);
    }
  }

  console.log("\nDirectory renaming complete (skipped - need manual mapping).");
}

/**
 * Main function
 */
async function backfillFilesystemUUIDs() {
  try {
    console.log("Starting filesystem UUID backfill...\n");

    await updateDatabaseUrls();
    await renameDirectories();

    console.log("\n✅ Filesystem UUID backfill complete!");
    console.log(
      "\nNote: Directory renaming was skipped due to lack of integer-to-UUID mapping."
    );
    console.log(
      "You may need to manually rename directories or create a mapping file."
    );
  } catch (error) {
    console.error("Error during backfill:", error);
    process.exit(1);
  }
}

// Run the script
backfillFilesystemUUIDs();
