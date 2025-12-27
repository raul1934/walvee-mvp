const { CityPhoto, PlacePhoto } = require("../models/sequelize");
const {
  getCityDetailsWithPhotos,
  getPlaceDetailsWithPhotos,
  getPhotoUrl,
} = require("../services/googleMapsService");
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
 * Check if a city has photos and fetch them if not
 * @param {Object} city - City model instance
 * @returns {Promise<boolean>} - Returns true if photos were added, false otherwise
 */
async function ensureCityHasPhotos(city) {
  try {
    if (!city.google_maps_id) {
      return false;
    }

    // Check if city already has photos
    const existingPhotos = await CityPhoto.count({
      where: { city_id: city.id },
    });

    if (existingPhotos > 0) {
      return false;
    }

    // Fetch city details with photos from Google Maps
    const cityDetails = await getCityDetailsWithPhotos(city.google_maps_id);

    if (!cityDetails.photos || cityDetails.photos.length === 0) {
      return false;
    }

    // Download and save photos locally (max 5 photos)
    const cityDir = path.join(IMAGE_DIR, "cities", city.id.toString());
    const photoPromises = cityDetails.photos
      .slice(0, 5)
      .map(async (photo, index) => {
        const ext = ".jpg";

        // Download single size (800px)
        const photoPath = path.join(cityDir, `${index}${ext}`);
        const result = await downloadImage(getPhotoUrl(photo.photo_reference, 800), photoPath);

        // Only create DB record if download was successful
        if (result.success) {
          return CityPhoto.create({
            city_id: city.id,
            google_photo_reference: photo.photo_reference,
            url: `/images/cities/${city.id}/${index}${ext}`,
            attribution: photo.html_attributions
              ? photo.html_attributions.join(", ")
              : null,
            photo_order: index,
          });
        }
        return null;
      });

    const results = await Promise.all(photoPromises);
    const successCount = results.filter((r) => r !== null).length;

    return successCount > 0;
  } catch (error) {
    console.error(
      `[Photo Checker] Error ensuring city photos for ${city.name}:`,
      error.message
    );
    return false;
  }
}

/**
 * Check if a place has photos and fetch them if not
 * @param {Object} place - Place model instance
 * @returns {Promise<boolean>} - Returns true if photos were added, false otherwise
 */
async function ensurePlaceHasPhotos(place) {
  try {
    if (!place.google_place_id) {
      return false;
    }

    // Check if place already has photos
    const existingPhotos = await PlacePhoto.count({
      where: { place_id: place.id },
    });

    if (existingPhotos > 0) {
      return false;
    }

    // Fetch place details with photos from Google Maps
    const placeDetails = await getPlaceDetailsWithPhotos(place.google_place_id);

    if (!placeDetails.photos || placeDetails.photos.length === 0) {
      return false;
    }

    // Download and save photos locally (max 10 photos)
    const placeDir = path.join(IMAGE_DIR, "places", place.id.toString());
    const photoPromises = placeDetails.photos
      .slice(0, 10)
      .map(async (photo, index) => {
        const ext = ".jpg";

        // Download single size (800px)
        const photoPath = path.join(placeDir, `${index}${ext}`);
        const result = await downloadImage(getPhotoUrl(photo.photo_reference, 800), photoPath);

        // Only create DB record if download was successful
        if (result.success) {
          return PlacePhoto.create({
            place_id: place.id,
            google_photo_reference: photo.photo_reference,
            url: `/images/places/${place.id}/${index}${ext}`,
            attribution: photo.html_attributions
              ? photo.html_attributions.join(", ")
              : null,
            photo_order: index,
          });
        }
        return null;
      });

    const results = await Promise.all(photoPromises);
    const successCount = results.filter((r) => r !== null).length;

    return successCount > 0;
  } catch (error) {
    console.error(
      `[Photo Checker] Error ensuring place photos for ${place.name}:`,
      error.message
    );
    return false;
  }
}

/**
 * Middleware to check and fetch photos for a city after creation/update
 * Usage: City.afterCreate(photoChecker.checkCityPhotos)
 */
const checkCityPhotos = async (city) => {
  // Run in background, don't wait for it
  setImmediate(async () => {
    try {
      await ensureCityHasPhotos(city);
    } catch (error) {
      console.error(
        `[Photo Checker] Background city photo check failed:`,
        error.message
      );
    }
  });
};

/**
 * Middleware to check and fetch photos for a place after creation/update
 * Usage: Place.afterCreate(photoChecker.checkPlacePhotos)
 */
const checkPlacePhotos = async (place) => {
  // Run in background, don't wait for it
  setImmediate(async () => {
    try {
      await ensurePlaceHasPhotos(place);
    } catch (error) {
      console.error(
        `[Photo Checker] Background place photo check failed:`,
        error.message
      );
    }
  });
};

module.exports = {
  ensureCityHasPhotos,
  ensurePlaceHasPhotos,
  checkCityPhotos,
  checkPlacePhotos,
};
