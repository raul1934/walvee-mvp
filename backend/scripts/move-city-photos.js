const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});
const fs = require("fs").promises;
const path = require("path");

const IMAGE_DIR = path.join(__dirname, "..", "images");

async function moveCityPhotoFiles() {
  try {
    console.log("Starting to move city photo files...");

    // Get all city photos with necessary data
    const [photos] = await sequelize.query(`
      SELECT cp.id, cp.city_id, c.country_id, cp.photo_order
      FROM city_photos cp
      JOIN cities c ON cp.city_id = c.id
      ORDER BY cp.city_id, cp.photo_order
    `);

    console.log(`Found ${photos.length} city photos to process`);

    let moved = 0;
    let skipped = 0;

    for (const photo of photos) {
      const { id, city_id, country_id, photo_order } = photo;

      // Old paths
      const oldDir = path.join(IMAGE_DIR, "cities", city_id);
      const oldSmall = path.join(oldDir, `${photo_order}_small.jpg`);
      const oldMedium = path.join(oldDir, `${photo_order}_medium.jpg`);
      const oldLarge = path.join(oldDir, `${photo_order}_large.jpg`);

      // New paths
      const newDir = path.join(IMAGE_DIR, "cities", country_id, city_id);
      const newSmall = path.join(newDir, `${id}_small.jpg`);
      const newMedium = path.join(newDir, `${id}_medium.jpg`);
      const newLarge = path.join(newDir, `${id}_large.jpg`);

      // Move files
      const files = [
        { old: oldSmall, new: newSmall },
        { old: oldMedium, new: newMedium },
        { old: oldLarge, new: newLarge },
      ];

      for (const file of files) {
        try {
          // Check if old file exists
          await fs.access(file.old);
          // Ensure new directory exists
          await fs.mkdir(path.dirname(file.new), { recursive: true });
          // Move file
          await fs.rename(file.old, file.new);
          console.log(
            `Moved: ${path.relative(IMAGE_DIR, file.old)} -> ${path.relative(
              IMAGE_DIR,
              file.new
            )}`
          );
          moved++;
        } catch (err) {
          if (err.code === "ENOENT") {
            console.log(
              `Skipped (not found): ${path.relative(IMAGE_DIR, file.old)}`
            );
            skipped++;
          } else {
            console.error(`Error moving ${file.old}: ${err.message}`);
          }
        }
      }
    }

    console.log(`\nMigration complete:`);
    console.log(`- Files moved: ${moved}`);
    console.log(`- Files skipped: ${skipped}`);

    // Clean up empty old directories
    console.log("\nCleaning up empty directories...");
    const [cities] = await sequelize.query(
      `SELECT DISTINCT city_id FROM city_photos`
    );
    for (const { city_id } of cities) {
      const oldDir = path.join(IMAGE_DIR, "cities", city_id);
      try {
        const files = await fs.readdir(oldDir);
        if (files.length === 0) {
          await fs.rmdir(oldDir);
          console.log(
            `Removed empty directory: ${path.relative(IMAGE_DIR, oldDir)}`
          );
        }
      } catch (err) {
        // Directory doesn't exist or not empty, skip
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

moveCityPhotoFiles();
