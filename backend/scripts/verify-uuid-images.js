const fs = require("fs").promises;
const path = require("path");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});
const IMAGE_DIR = path.join(__dirname, "..", "images");

/**
 * Verify that UUID directories exist and contain expected images
 */
async function verifyUUIDDirectories() {
  console.log("Verifying UUID directories and image accessibility...\n");

  // Check city photos
  console.log("Checking city photos...");
  const [cityPhotos] = await sequelize.query(`
    SELECT cp.id, cp.city_id, cp.url_small, cp.photo_order
    FROM city_photos cp
    ORDER BY cp.city_id, cp.photo_order
    LIMIT 5
  `);

  for (const photo of cityPhotos) {
    const uuidDir = path.join(IMAGE_DIR, "cities", photo.city_id);
    const smallPath = path.join(uuidDir, `${photo.photo_order}_small.jpg`);
    const mediumPath = path.join(uuidDir, `${photo.photo_order}_medium.jpg`);
    const largePath = path.join(uuidDir, `${photo.photo_order}_large.jpg`);

    try {
      await fs.access(uuidDir);
      console.log(`✓ Directory exists: ${uuidDir}`);
    } catch (err) {
      console.log(`✗ Directory missing: ${uuidDir}`);
      continue;
    }

    try {
      await fs.access(smallPath);
      console.log(`✓ Small image exists: ${smallPath}`);
    } catch (err) {
      console.log(`✗ Small image missing: ${smallPath}`);
    }

    try {
      await fs.access(mediumPath);
      console.log(`✓ Medium image exists: ${mediumPath}`);
    } catch (err) {
      console.log(`✗ Medium image missing: ${mediumPath}`);
    }

    try {
      await fs.access(largePath);
      console.log(`✓ Large image exists: ${largePath}`);
    } catch (err) {
      console.log(`✗ Large image missing: ${largePath}`);
    }
  }

  // Check place photos
  console.log("\nChecking place photos...");
  const [placePhotos] = await sequelize.query(`
    SELECT pp.id, pp.place_id, pp.url_small, pp.photo_order
    FROM place_photos pp
    ORDER BY pp.place_id, pp.photo_order
    LIMIT 5
  `);

  for (const photo of placePhotos) {
    const uuidDir = path.join(IMAGE_DIR, "places", photo.place_id);
    const smallPath = path.join(uuidDir, `${photo.photo_order}_small.jpg`);
    const mediumPath = path.join(uuidDir, `${photo.photo_order}_medium.jpg`);
    const largePath = path.join(uuidDir, `${photo.photo_order}_large.jpg`);

    try {
      await fs.access(uuidDir);
      console.log(`✓ Directory exists: ${uuidDir}`);
    } catch (err) {
      console.log(`✗ Directory missing: ${uuidDir}`);
      continue;
    }

    try {
      await fs.access(smallPath);
      console.log(`✓ Small image exists: ${smallPath}`);
    } catch (err) {
      console.log(`✗ Small image missing: ${smallPath}`);
    }

    try {
      await fs.access(mediumPath);
      console.log(`✓ Medium image exists: ${mediumPath}`);
    } catch (err) {
      console.log(`✗ Medium image missing: ${mediumPath}`);
    }

    try {
      await fs.access(largePath);
      console.log(`✓ Large image exists: ${largePath}`);
    } catch (err) {
      console.log(`✗ Large image missing: ${largePath}`);
    }
  }

  console.log("\n✅ Verification complete!");
}

/**
 * Main function
 */
async function main() {
  try {
    await verifyUUIDDirectories();
  } catch (error) {
    console.error("Error during verification:", error);
    process.exit(1);
  }
}

// Run the script
main();
