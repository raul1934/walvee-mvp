console.log(
  "SCRIPT STARTED - THIS SHOULD BE FIRST LINE - TIMESTAMP:",
  new Date().toISOString()
);

const fs = require("fs").promises;
const path = require("path");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});
const IMAGE_DIR = path.join(__dirname, "..", "images");

/**
 * Copy all files from old integer directories to UUID directories
 */
async function copyAllImages() {
  console.log("=== STARTING IMAGE COPY PROCESS ===\n");
  console.log("DEBUG: Function started");

  console.log("🔍 Starting places processing...");
  console.log("TEST: About to query places...");

  let placeMappings;
  try {
    // Get mapping of UUID to old integer directory
    [placeMappings] = await sequelize.query(`
      SELECT DISTINCT pp.place_id, SUBSTRING_INDEX(SUBSTRING_INDEX(pp.url_small, '/places/', -1), '/', 1) as old_dir
      FROM place_photos pp
      WHERE pp.url_small LIKE '/images/places/%'
      ORDER BY pp.place_id
    `);

    console.log(`📊 Found ${placeMappings.length} place mappings`);
    console.log("📋 First 3 place mappings:", placeMappings.slice(0, 3));
  } catch (error) {
    console.error("❌ Error in places query:", error);
    return;
  }

  console.log("🔄 Starting places loop...");
  let processedPlaces = 0;
  for (const mapping of placeMappings) {
    const { place_id: uuid, old_dir } = mapping;
    console.log(`🏷️  Processing place: ${uuid} -> ${old_dir}`);
    processedPlaces++;

    if (!old_dir || old_dir === uuid) {
      console.log(`  ⏭️  Skipping place ${uuid} (old_dir: ${old_dir})`);
      continue; // Skip if already UUID or no old dir
    }

    const oldPath = path.join(IMAGE_DIR, "places", old_dir);
    const newPath = path.join(IMAGE_DIR, "places", uuid);

    try {
      // Check if old directory exists
      await fs.access(oldPath);
      console.log(`  📁 Old directory exists: ${oldPath}`);
    } catch (err) {
      console.log(`  ⚠️  Old directory ${oldPath} does not exist, skipping`);
      continue;
    }

    // Create new directory if it doesn't exist
    try {
      await fs.mkdir(newPath, { recursive: true });
      console.log(`  📁 Created new directory: ${newPath}`);
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }

    // Copy all files from old directory to new directory
    try {
      const files = await fs.readdir(oldPath);
      const imageFiles = files.filter(
        (file) => file.endsWith(".jpg") && !file.includes("_temp")
      );
      console.log(`  📸 Found ${imageFiles.length} image files to copy`);

      for (const file of imageFiles) {
        const oldFilePath = path.join(oldPath, file);
        const newFilePath = path.join(newPath, file);

        try {
          await fs.copyFile(oldFilePath, newFilePath);
          console.log(`  ✓ Copied ${oldFilePath} → ${newFilePath}`);
        } catch (err) {
          console.log(`  ⚠️  Failed to copy ${oldFilePath}: ${err.message}`);
        }
      }
    } catch (err) {
      console.log(
        `  ⚠️  Error reading old directory ${oldPath}: ${err.message}`
      );
    }
  }
  console.log(
    `🏁 Places processing complete. Processed ${processedPlaces} places.\n`
  );

  // Do the same for cities
  const [cityMappings] = await sequelize.query(`
    SELECT DISTINCT cp.city_id, SUBSTRING_INDEX(SUBSTRING_INDEX(cp.url_small, '/cities/', -1), '/', 1) as old_dir
    FROM city_photos cp
    WHERE cp.url_small LIKE '/images/cities/%'
    ORDER BY cp.city_id
  `);

  console.log(`\nFound ${cityMappings.length} city mappings`);

  for (const mapping of cityMappings) {
    const { city_id: uuid, old_dir } = mapping;

    if (!old_dir || old_dir === uuid) continue; // Skip if already UUID or no old dir

    const oldPath = path.join(IMAGE_DIR, "cities", old_dir);
    const newPath = path.join(IMAGE_DIR, "cities", uuid);

    try {
      // Check if old directory exists
      await fs.access(oldPath);
    } catch (err) {
      console.log(`⚠ Old directory ${oldPath} does not exist, skipping`);
      continue;
    }

    // Create new directory if it doesn't exist
    try {
      await fs.mkdir(newPath, { recursive: true });
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }

    // Copy all files from old directory to new directory
    try {
      const files = await fs.readdir(oldPath);
      const imageFiles = files.filter(
        (file) => file.endsWith(".jpg") && !file.includes("_temp")
      );

      for (const file of imageFiles) {
        const oldFilePath = path.join(oldPath, file);
        const newFilePath = path.join(newPath, file);

        try {
          await fs.copyFile(oldFilePath, newFilePath);
          console.log(`✓ Copied ${oldFilePath} → ${newFilePath}`);
        } catch (err) {
          console.log(`⚠ Failed to copy ${oldFilePath}: ${err.message}`);
        }
      }
    } catch (err) {
      console.log(`⚠ Error reading old directory ${oldPath}: ${err.message}`);
    }
  }

  console.log("\n✅ Image copying complete!");
}

/**
 * Main function
 */
async function main() {
  try {
    await copyAllImages();
  } catch (error) {
    console.error("Error during image copying:", error);
    process.exit(1);
  }
}

// Run the script
main();
