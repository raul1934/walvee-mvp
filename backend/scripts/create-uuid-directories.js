const fs = require("fs").promises;
const path = require("path");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});
const IMAGE_DIR = path.join(__dirname, "..", "images");

/**
 * Create UUID directories and copy images from integer directories
 */
async function createUUIDDirectories() {
  console.log("Creating UUID directories and copying images...\n");

  // Process city photos
  console.log("Processing city photos...");
  const [cityPhotos] = await sequelize.query(`
    SELECT cp.id, cp.city_id, cp.url_small, cp.photo_order
    FROM city_photos cp
    ORDER BY cp.city_id, cp.photo_order
  `);

  const cityGroups = {};
  cityPhotos.forEach((photo) => {
    if (!cityGroups[photo.city_id]) {
      cityGroups[photo.city_id] = [];
    }
    cityGroups[photo.city_id].push(photo);
  });

  for (const [cityId, photos] of Object.entries(cityGroups)) {
    const uuidDir = path.join(IMAGE_DIR, "cities", cityId);

    // Create UUID directory if it doesn't exist
    try {
      await fs.mkdir(uuidDir, { recursive: true });
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }

    // For each photo, try to find it in old integer directories
    for (const photo of photos) {
      const oldPathMatch = photo.url_small.match(/\/images\/cities\/(\d+)\//);
      if (oldPathMatch) {
        const oldDirId = oldPathMatch[1];
        const oldDir = path.join(IMAGE_DIR, "cities", oldDirId);

        // Check if old directory exists
        try {
          await fs.access(oldDir);

          // Copy images from old directory to new UUID directory
          const oldSmall = path.join(oldDir, `${photo.photo_order}_small.jpg`);
          const oldMedium = path.join(
            oldDir,
            `${photo.photo_order}_medium.jpg`
          );
          const oldLarge = path.join(oldDir, `${photo.photo_order}_large.jpg`);

          const newSmall = path.join(uuidDir, `${photo.photo_order}_small.jpg`);
          const newMedium = path.join(
            uuidDir,
            `${photo.photo_order}_medium.jpg`
          );
          const newLarge = path.join(uuidDir, `${photo.photo_order}_large.jpg`);

          // Copy files if they exist
          try {
            await fs.copyFile(oldSmall, newSmall);
            console.log(`✓ Copied ${oldSmall} → ${newSmall}`);
          } catch (err) {
            console.log(`⚠ Could not copy ${oldSmall}: ${err.message}`);
          }

          try {
            await fs.copyFile(oldMedium, newMedium);
            console.log(`✓ Copied ${oldMedium} → ${newMedium}`);
          } catch (err) {
            console.log(`⚠ Could not copy ${oldMedium}: ${err.message}`);
          }

          try {
            await fs.copyFile(oldLarge, newLarge);
            console.log(`✓ Copied ${oldLarge} → ${newLarge}`);
          } catch (err) {
            console.log(`⚠ Could not copy ${oldLarge}: ${err.message}`);
          }
        } catch (err) {
          console.log(`⚠ Old directory ${oldDir} not found for city ${cityId}`);
        }
      }
    }
  }

  // Process place photos
  console.log("\nProcessing place photos...");
  const [placePhotos] = await sequelize.query(`
    SELECT pp.id, pp.place_id, pp.url_small, pp.photo_order
    FROM place_photos pp
    ORDER BY pp.place_id, pp.photo_order
  `);

  const placeGroups = {};
  placePhotos.forEach((photo) => {
    if (!placeGroups[photo.place_id]) {
      placeGroups[photo.place_id] = [];
    }
    placeGroups[photo.place_id].push(photo);
  });

  for (const [placeId, photos] of Object.entries(placeGroups)) {
    const uuidDir = path.join(IMAGE_DIR, "places", placeId);

    // Create UUID directory if it doesn't exist
    try {
      await fs.mkdir(uuidDir, { recursive: true });
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }

    // For each photo, try to find it in old integer directories
    for (const photo of photos) {
      const oldPathMatch = photo.url_small.match(/\/images\/places\/(\d+)\//);
      if (oldPathMatch) {
        const oldDirId = oldPathMatch[1];
        const oldDir = path.join(IMAGE_DIR, "places", oldDirId);

        // Check if old directory exists
        try {
          await fs.access(oldDir);

          // Copy images from old directory to new UUID directory
          const oldSmall = path.join(oldDir, `${photo.photo_order}_small.jpg`);
          const oldMedium = path.join(
            oldDir,
            `${photo.photo_order}_medium.jpg`
          );
          const oldLarge = path.join(oldDir, `${photo.photo_order}_large.jpg`);

          const newSmall = path.join(uuidDir, `${photo.photo_order}_small.jpg`);
          const newMedium = path.join(
            uuidDir,
            `${photo.photo_order}_medium.jpg`
          );
          const newLarge = path.join(uuidDir, `${photo.photo_order}_large.jpg`);

          // Copy files if they exist
          try {
            await fs.copyFile(oldSmall, newSmall);
            console.log(`✓ Copied ${oldSmall} → ${newSmall}`);
          } catch (err) {
            console.log(`⚠ Could not copy ${oldSmall}: ${err.message}`);
          }

          try {
            await fs.copyFile(oldMedium, newMedium);
            console.log(`✓ Copied ${oldMedium} → ${newMedium}`);
          } catch (err) {
            console.log(`⚠ Could not copy ${oldMedium}: ${err.message}`);
          }

          try {
            await fs.copyFile(oldLarge, newLarge);
            console.log(`✓ Copied ${oldLarge} → ${newLarge}`);
          } catch (err) {
            console.log(`⚠ Could not copy ${oldLarge}: ${err.message}`);
          }
        } catch (err) {
          console.log(
            `⚠ Old directory ${oldDir} not found for place ${placeId}`
          );
        }
      }
    }
  }

  console.log("\n✅ UUID directory creation and image copying complete!");
  console.log(
    "\nNote: You can now safely remove the old integer-named directories after verifying everything works."
  );
}

/**
 * Main function
 */
async function main() {
  try {
    await createUUIDDirectories();
  } catch (error) {
    console.error("Error during directory creation:", error);
    process.exit(1);
  }
}

// Run the script
main();
