const { City, Place, CityPhoto, PlacePhoto } = require("../models/sequelize");
const {
  getCityDetailsWithPhotos,
  getPlaceDetailsWithPhotos,
} = require("../services/googleMapsService");
const { sequelize } = require("../database/sequelize");
const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

// Configuration
const IMAGE_DIR =
  process.env.IMAGE_DIR || path.join(__dirname, "..", "..", "images");

/**
 * Download image from URL and save locally
 */
async function downloadImage(url, outputPath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!url || url.trim() === "" || url === "null") {
        return { success: false, reason: "Invalid URL" };
      }

      const response = await axios({
        method: "GET",
        url: url,
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      // Ensure directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Write file
      await fs.writeFile(outputPath, response.data);

      // Set file permissions
      await fs.chmod(outputPath, 0o644);

      return { success: true, size: response.data.length };
    } catch (error) {
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        return { success: false, reason: error.message, url: url };
      }
    }
  }
}

/**
 * Get file extension from URL
 */
function getFileExtension(url) {
  const urlExt = path.extname(url).split("?")[0].toLowerCase();
  if (urlExt && [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(urlExt)) {
    return urlExt;
  }
  return ".jpg"; // Default
}

/**
 * Fetch and save photos for cities that don't have any photos
 */
async function fetchMissingCityPhotos() {
  console.log("\n=== Fetching Missing City Photos ===\n");

  try {
    // Find all cities that have a google_maps_id but no photos
    const citiesWithoutPhotos = await City.findAll({
      where: {
        google_maps_id: { [require("sequelize").Op.ne]: null },
      },
      include: [
        {
          model: CityPhoto,
          as: "photos",
          required: false,
        },
      ],
    });

    const citiesToUpdate = citiesWithoutPhotos.filter(
      (city) => !city.photos || city.photos.length === 0
    );

    console.log(`Found ${citiesToUpdate.length} cities without photos\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const city of citiesToUpdate) {
      try {
        console.log(`Fetching photos for: ${city.name} (ID: ${city.id})`);

        // Fetch city details with photos from Google Maps
        const cityDetails = await getCityDetailsWithPhotos(city.google_maps_id);

        if (cityDetails.photos && cityDetails.photos.length > 0) {
          // Download and save photos locally
          const cityDir = path.join(IMAGE_DIR, "cities", city.id.toString());
          const photoPromises = cityDetails.photos
            .slice(0, 5)
            .map(async (photo, index) => {
              const ext = getFileExtension(photo.url_small || ".jpg");

              // Download three sizes
              const smallPath = path.join(cityDir, `${index}_small${ext}`);
              const mediumPath = path.join(cityDir, `${index}_medium${ext}`);
              const largePath = path.join(cityDir, `${index}_large${ext}`);

              const [smallResult, mediumResult, largeResult] =
                await Promise.all([
                  downloadImage(photo.url_small, smallPath),
                  downloadImage(photo.url_medium, mediumPath),
                  downloadImage(photo.url_large, largePath),
                ]);

              // Only create DB record if at least one size downloaded successfully
              if (
                smallResult.success ||
                mediumResult.success ||
                largeResult.success
              ) {
                return CityPhoto.create({
                  city_id: city.id,
                  google_photo_reference: photo.photo_reference,
                  url_small: smallResult.success
                    ? `/images/cities/${city.id}/${index}_small${ext}`
                    : null,
                  url_medium: mediumResult.success
                    ? `/images/cities/${city.id}/${index}_medium${ext}`
                    : null,
                  url_large: largeResult.success
                    ? `/images/cities/${city.id}/${index}_large${ext}`
                    : null,
                  width: photo.width,
                  height: photo.height,
                  attribution: photo.html_attributions
                    ? photo.html_attributions.join(", ")
                    : null,
                  photo_order: index,
                });
              }
              return null;
            });

          const results = await Promise.all(photoPromises);
          const downloadedCount = results.filter((r) => r !== null).length;

          console.log(
            `✓ Downloaded and saved ${downloadedCount} photos for ${city.name}\n`
          );
          successCount++;
        } else {
          console.log(`⚠ No photos available for ${city.name}\n`);
        }

        // Add delay to respect Google API rate limits
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(
          `✗ Error fetching photos for ${city.name}:`,
          error.message
        );
        errorCount++;
      }
    }

    console.log("\n=== City Photos Summary ===");
    console.log(`Total cities processed: ${citiesToUpdate.length}`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (error) {
    console.error("Error in fetchMissingCityPhotos:", error);
    throw error;
  }
}

/**
 * Fetch and save photos for places that don't have any photos
 */
async function fetchMissingPlacePhotos() {
  console.log("\n=== Fetching Missing Place Photos ===\n");

  try {
    // Find all places that have a google_place_id but no photos
    const placesWithoutPhotos = await Place.findAll({
      where: {
        google_place_id: { [require("sequelize").Op.ne]: null },
      },
      include: [
        {
          model: PlacePhoto,
          as: "photos",
          required: false,
        },
      ],
    });

    const placesToUpdate = placesWithoutPhotos.filter(
      (place) => !place.photos || place.photos.length === 0
    );

    console.log(`Found ${placesToUpdate.length} places without photos\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const place of placesToUpdate) {
      try {
        console.log(`Fetching photos for: ${place.name} (ID: ${place.id})`);

        // Fetch place details with photos from Google Maps
        const placeDetails = await getPlaceDetailsWithPhotos(
          place.google_place_id
        );

        if (placeDetails.photos && placeDetails.photos.length > 0) {
          // Download and save photos locally
          const placeDir = path.join(IMAGE_DIR, "places", place.id.toString());
          const photoPromises = placeDetails.photos
            .slice(0, 10)
            .map(async (photo, index) => {
              const ext = getFileExtension(photo.url_small || ".jpg");

              // Download three sizes
              const smallPath = path.join(placeDir, `${index}_small${ext}`);
              const mediumPath = path.join(placeDir, `${index}_medium${ext}`);
              const largePath = path.join(placeDir, `${index}_large${ext}`);

              const [smallResult, mediumResult, largeResult] =
                await Promise.all([
                  downloadImage(photo.url_small, smallPath),
                  downloadImage(photo.url_medium, mediumPath),
                  downloadImage(photo.url_large, largePath),
                ]);

              // Only create DB record if at least one size downloaded successfully
              if (
                smallResult.success ||
                mediumResult.success ||
                largeResult.success
              ) {
                return PlacePhoto.create({
                  place_id: place.id,
                  google_photo_reference: photo.photo_reference,
                  url_small: smallResult.success
                    ? `/images/places/${place.id}/${index}_small${ext}`
                    : null,
                  url_medium: mediumResult.success
                    ? `/images/places/${place.id}/${index}_medium${ext}`
                    : null,
                  url_large: largeResult.success
                    ? `/images/places/${place.id}/${index}_large${ext}`
                    : null,
                  width: photo.width,
                  height: photo.height,
                  attribution: photo.html_attributions
                    ? photo.html_attributions.join(", ")
                    : null,
                  photo_order: index,
                });
              }
              return null;
            });

          const results = await Promise.all(photoPromises);
          const downloadedCount = results.filter((r) => r !== null).length;

          console.log(
            `✓ Downloaded and saved ${downloadedCount} photos for ${place.name}\n`
          );
          successCount++;
        } else {
          console.log(`⚠ No photos available for ${place.name}\n`);
        }

        // Add delay to respect Google API rate limits
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(
          `✗ Error fetching photos for ${place.name}:`,
          error.message
        );
        errorCount++;
      }
    }

    console.log("\n=== Place Photos Summary ===");
    console.log(`Total places processed: ${placesToUpdate.length}`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (error) {
    console.error("Error in fetchMissingPlacePhotos:", error);
    throw error;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  console.log("=== Starting Photo Fetch Script ===");
  console.log(`Started at: ${new Date().toISOString()}\n`);

  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✓ Database connection established\n");

    // Fetch missing city photos
    await fetchMissingCityPhotos();

    // Fetch missing place photos
    await fetchMissingPlacePhotos();

    console.log("\n=== Photo Fetch Script Completed ===");
    console.log(`Finished at: ${new Date().toISOString()}`);
  } catch (error) {
    console.error("\n=== Script Failed ===");
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fetchMissingCityPhotos, fetchMissingPlacePhotos };
