const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");
const { getConnection, query } = require("../src/database/connection");
// Configuration
const CONFIG = {
  NEW_IMAGE_DIR:
    process.env.NEW_IMAGE_DIR || path.join(__dirname, "..", "images"),
  BACKUP_DIR: process.env.BACKUP_DIR || path.join(__dirname, "..", "backups"),
  MAX_CONCURRENT_DOWNLOADS: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS) || 5,
  RETRY_ATTEMPTS: parseInt(process.env.RETRY_ATTEMPTS) || 3,
  DRY_RUN: process.argv.includes("--dry-run"),
  BASE_URL: process.env.BASE_URL || "http://localhost:3000",
};

// Statistics tracking
const stats = {
  users: { total: 0, success: 0, failed: 0, skipped: 0 },
  trips: { total: 0, success: 0, failed: 0, skipped: 0 },
  tripImages: { total: 0, success: 0, failed: 0, skipped: 0 },
  placePhotos: { total: 0, success: 0, failed: 0, skipped: 0 },
  cityPhotos: { total: 0, success: 0, failed: 0, skipped: 0 },
};

const urlMapping = {};
const failedDownloads = [];
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Download image with retry logic
 */
async function downloadImage(url, outputPath, retries = CONFIG.RETRY_ATTEMPTS) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Skip if URL is null, empty, or invalid
      if (!url || url.trim() === "" || url === "null") {
        return { success: false, reason: "Invalid URL" };
      }

      // Skip if already migrated (starts with /images/)
      if (url.startsWith("/images/")) {
        return { success: false, reason: "Already migrated" };
      }

      // Skip if URL doesn't start with http/https (already a local path)
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return { success: false, reason: "Already local path" };
      }

      // Check if file already exists in storage
      try {
        await fs.access(outputPath);
        console.log(`  ⏭️  File already exists: ${outputPath}`);
        return { success: false, reason: "File already exists" };
      } catch (err) {
        // File doesn't exist, continue with download
      }

      // Handle relative URLs (local uploads)
      let downloadUrl = url;
      if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
        downloadUrl = `${CONFIG.BASE_URL}/${url.replace(/^\//, "")}`;
      }

      console.log(
        `  [${attempt}/${retries}] Downloading: ${downloadUrl.substring(
          0,
          80
        )}...`
      );

      const response = await axios({
        method: "GET",
        url: downloadUrl,
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

      console.log(`  ✓ Saved to: ${outputPath}`);
      return { success: true, size: response.data.length };
    } catch (error) {
      console.error(`  ✗ Attempt ${attempt} failed: ${error.message}`);

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`  Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      } else {
        return {
          success: false,
          reason: error.message,
          url: url,
        };
      }
    }
  }
}

/**
 * Resize image to multiple sizes
 */
async function resizeImage(inputPath, baseOutputPath, sizes) {
  const results = {};

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    for (const size of sizes) {
      const outputPath = `${baseOutputPath}_${size.name}.jpg`;

      await sharp(inputPath)
        .resize(size.maxWidth, null, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);

      await fs.chmod(outputPath, 0o644);
      results[size.name] = outputPath;
      console.log(
        `    ✓ Created ${size.name} (${size.maxWidth}px): ${outputPath}`
      );
    }

    return { success: true, paths: results };
  } catch (error) {
    console.error(`    ✗ Resize failed: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

/**
 * Resize a single output (no suffix) to a max width
 */
async function resizeSingle(inputPath, outputPath, maxWidth) {
  try {
    await sharp(inputPath)
      .resize(maxWidth, null, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    await fs.chmod(outputPath, 0o644);
    console.log(`    ✓ Created single file: ${outputPath}`);
    return { success: true, path: outputPath };
  } catch (error) {
    console.error(`    ✗ Resize single failed: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

/**
 * Simple concurrency mapper (like p-map) to run async mapper over items with limited concurrency
 */
async function pMap(
  items,
  mapper,
  concurrency = CONFIG.MAX_CONCURRENT_DOWNLOADS
) {
  const results = new Array(items.length);
  let idx = 0;

  const workers = Array.from({
    length: Math.min(concurrency, items.length),
  }).map(async () => {
    while (true) {
      const current = idx++;
      if (current >= items.length) return;
      try {
        results[current] = await mapper(items[current], current);
      } catch (err) {
        results[current] = err;
      }
    }
  });

  await Promise.all(workers);
  return results;
}

/**
 * Get file extension from URL or content type
 */
function getFileExtension(url, contentType = "") {
  // Try to get from URL
  const urlExt = path.extname(url).split("?")[0].toLowerCase();
  if (urlExt && [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(urlExt)) {
    return urlExt;
  }

  // Try to get from content type
  if (contentType) {
    const typeMap = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
    };
    return typeMap[contentType.toLowerCase()] || ".jpg";
  }

  return ".jpg"; // Default
}

/**
 * Strip BASE_URL (or localhost URL) from a url and return a relative path starting with '/'
 */
function toRelativePath(url) {
  if (!url) return url;
  try {
    // If already relative and starts with /images/, return as-is
    if (url.startsWith("/images/")) return url;

    // Remove BASE_URL if present
    if (CONFIG.BASE_URL && url.startsWith(CONFIG.BASE_URL)) {
      return url.replace(CONFIG.BASE_URL, "");
    }

    // Remove localhost:3000 patterns
    const localhostPrefix = "http://localhost:3000";
    if (url.startsWith(localhostPrefix))
      return url.replace(localhostPrefix, "");

    const localhostPrefixHttps = "https://localhost:3000";
    if (url.startsWith(localhostPrefixHttps))
      return url.replace(localhostPrefixHttps, "");

    // If it is an absolute URL to our host, attempt to parse and return pathname
    try {
      const parsed = new URL(url);
      if (parsed.pathname) return parsed.pathname + (parsed.search || "");
    } catch (e) {
      // not a full url
    }

    return url;
  } catch (e) {
    return url;
  }
}

/**
 * Create database backup
 */
async function createBackup(connection) {
  console.log("\n📦 Creating database backup...");

  const backup = {
    timestamp: new Date().toISOString(),
    tables: {},
  };

  try {
    // Backup users
    const [users] = await connection.query(
      "SELECT id, photo_url FROM users WHERE photo_url IS NOT NULL"
    );
    backup.tables.users = users;
    console.log(`  ✓ Backed up ${users.length} users`);

    // Backup trips
    const [trips] = await connection.query(
      "SELECT id, cover_image FROM trips WHERE cover_image IS NOT NULL"
    );
    backup.tables.trips = trips;
    console.log(`  ✓ Backed up ${trips.length} trips`);

    // Backup trip_images (if table exists)
    try {
      const [tripImages] = await connection.query(
        "SELECT id, trip_id, image_url, display_order FROM trip_images WHERE image_url IS NOT NULL"
      );
      backup.tables.trip_images = tripImages;
      console.log(`  ✓ Backed up ${tripImages.length} trip images`);
    } catch (err) {
      console.log(`  ⚠ trip_images table doesn't exist, skipping`);
      backup.tables.trip_images = [];
    }

    // Backup place_photos
    const [placePhotos] = await connection.query(
      "SELECT id, place_id, url_small, url_medium, url_large, photo_order FROM place_photos"
    );
    backup.tables.place_photos = placePhotos;
    console.log(`  ✓ Backed up ${placePhotos.length} place photos`);

    // Backup city_photos
    const [cityPhotos] = await connection.query(
      "SELECT id, city_id, url_small, url_medium, url_large, photo_order FROM city_photos"
    );
    backup.tables.city_photos = cityPhotos;
    console.log(`  ✓ Backed up ${cityPhotos.length} city photos`);

    // Save backup to file
    const backupPath = path.join(CONFIG.BACKUP_DIR, `backup-${timestamp}.json`);
    await fs.mkdir(CONFIG.BACKUP_DIR, { recursive: true });
    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
    console.log(`  ✓ Backup saved to: ${backupPath}\n`);

    return backup;
  } catch (error) {
    console.error("  ✗ Backup failed:", error.message);
    throw error;
  }
}

/**
 * Migrate user photos
 */
async function migrateUsers(connection) {
  console.log("\n👤 Migrating user photos...");

  const [users] = await connection.query(
    'SELECT id, photo_url FROM users WHERE photo_url IS NOT NULL AND photo_url != ""'
  );
  stats.users.total = users.length;
  console.log(`  Found ${users.length} users with photos`);

  // Run users migration with concurrency
  await pMap(
    users,
    async (user) => {
      // We'll standardize user photos to JPEG and create a single large file
      const userDir = path.join(CONFIG.NEW_IMAGE_DIR, "users");
      const finalPath = path.join(userDir, `${user.id}.jpg`);
      const finalUrl = `/images/users/${user.id}.jpg`;

      try {
        // If final file already exists, ensure DB has relative path
        try {
          await fs.access(finalPath);
          // File exists
          const currentRel = toRelativePath(user.photo_url);
          if (currentRel !== finalUrl && !CONFIG.DRY_RUN) {
            await query("UPDATE users SET photo_url = ? WHERE id = ?", [
              finalUrl,
              user.id,
            ]);
            console.log(`  ✓ Updated DB for user ${user.id} -> ${finalUrl}`);
          }
          stats.users.skipped++;
          return;
        } catch (err) {
          // final file does not exist, continue
        }

        // Check for temp
        const tempPath = path.join(userDir, `${user.id}_temp.jpg`);
        let downloadResult;
        try {
          await fs.access(tempPath);
          console.log(`  ⏭️  Temp file already exists, using: ${tempPath}`);
          downloadResult = { success: true };
        } catch (err) {
          downloadResult = await downloadImage(user.photo_url, tempPath);
        }

        if (!downloadResult.success) {
          stats.users.failed++;
          failedDownloads.push({
            table: "users",
            id: user.id,
            field: "photo_url",
            url: user.photo_url,
            reason: downloadResult.reason,
          });
          return;
        }

        // Resize temp to final
        const resizeRes = await resizeSingle(tempPath, finalPath, 1600);
        if (!resizeRes.success) {
          stats.users.failed++;
          failedDownloads.push({
            table: "users",
            id: user.id,
            field: "photo_url",
            url: user.photo_url,
            reason: resizeRes.reason,
          });
          return;
        }

        // Update DB for this user to relative path
        if (!CONFIG.DRY_RUN) {
          await query("UPDATE users SET photo_url = ? WHERE id = ?", [
            finalUrl,
            user.id,
          ]);
          console.log(`  ✓ Updated DB for user ${user.id} -> ${finalUrl}`);
        }

        stats.users.success++;
      } catch (error) {
        stats.users.failed++;
        failedDownloads.push({
          table: "users",
          id: user.id,
          field: "photo_url",
          url: user.photo_url,
          reason: error.message,
        });
      }
    },
    CONFIG.MAX_CONCURRENT_DOWNLOADS
  );

  console.log(
    `  ✓ Success: ${stats.users.success}, Failed: ${stats.users.failed}`
  );
}

/**
 * Migrate trip cover images
 */
async function migrateTrips(connection) {
  console.log("\n🗺️  Migrating trip cover images...");

  const [trips] = await connection.query(
    'SELECT id, cover_image FROM trips WHERE cover_image IS NOT NULL AND cover_image != ""'
  );
  stats.trips.total = trips.length;
  console.log(`  Found ${trips.length} trips with cover images`);

  await pMap(
    trips,
    async (trip) => {
      // Skip unsplash URLs (these are dynamic/generic)
      if (trip.cover_image.includes("unsplash.com")) {
        stats.trips.skipped++;
        return;
      }

      const tripDir = path.join(CONFIG.NEW_IMAGE_DIR, "trips", trip.id);
      const finalPath = path.join(tripDir, `cover.jpg`);
      const finalUrl = `/images/trips/${trip.id}/cover.jpg`;

      try {
        // Ensure dir
        await fs.mkdir(tripDir, { recursive: true });

        // If final exists, ensure DB path
        try {
          await fs.access(finalPath);
          const currentRel = toRelativePath(trip.cover_image);
          if (currentRel !== finalUrl && !CONFIG.DRY_RUN) {
            await query("UPDATE trips SET cover_image = ? WHERE id = ?", [
              finalUrl,
              trip.id,
            ]);
            console.log(`  ✓ Updated DB for trip ${trip.id} -> ${finalUrl}`);
          }
          stats.trips.skipped++;
          return;
        } catch (err) {
          // final missing
        }

        const tempPath = path.join(tripDir, `cover_temp.jpg`);
        let downloadResult;
        try {
          await fs.access(tempPath);
          console.log(`  ⏭️  Temp file already exists, using: ${tempPath}`);
          downloadResult = { success: true };
        } catch (err) {
          downloadResult = await downloadImage(trip.cover_image, tempPath);
        }

        if (!downloadResult.success) {
          stats.trips.failed++;
          failedDownloads.push({
            table: "trips",
            id: trip.id,
            field: "cover_image",
            url: trip.cover_image,
            reason: downloadResult.reason,
          });
          return;
        }

        const resizeRes = await resizeSingle(tempPath, finalPath, 1600);
        if (!resizeRes.success) {
          stats.trips.failed++;
          failedDownloads.push({
            table: "trips",
            id: trip.id,
            field: "cover_image",
            url: trip.cover_image,
            reason: resizeRes.reason,
          });
          return;
        }

        if (!CONFIG.DRY_RUN) {
          await query("UPDATE trips SET cover_image = ? WHERE id = ?", [
            finalUrl,
            trip.id,
          ]);
          console.log(`  ✓ Updated DB for trip ${trip.id} -> ${finalUrl}`);
        }

        stats.trips.success++;
      } catch (error) {
        stats.trips.failed++;
        failedDownloads.push({
          table: "trips",
          id: trip.id,
          field: "cover_image",
          url: trip.cover_image,
          reason: error.message,
        });
      }
    },
    CONFIG.MAX_CONCURRENT_DOWNLOADS
  );

  console.log(
    `  ✓ Success: ${stats.trips.success}, Failed: ${stats.trips.failed}, Skipped: ${stats.trips.skipped}`
  );
}

/**
 * Migrate trip images
 */
async function migrateTripImages(connection) {
  console.log("\n📸 Migrating trip images...");

  try {
    const [tripImages] = await connection.query(
      'SELECT id, trip_id, image_url, display_order FROM trip_images WHERE image_url IS NOT NULL AND image_url != ""'
    );
    stats.tripImages.total = tripImages.length;
    console.log(`  Found ${tripImages.length} trip images`);

    await pMap(
      tripImages,
      async (image) => {
        const tripDir = path.join(CONFIG.NEW_IMAGE_DIR, "trips", image.trip_id);
        const finalPath = path.join(tripDir, `${image.display_order}.jpg`);
        const finalUrl = `/images/trips/${image.trip_id}/${image.display_order}.jpg`;

        try {
          await fs.mkdir(tripDir, { recursive: true });

          try {
            await fs.access(finalPath);
            const currentRel = toRelativePath(image.image_url);
            if (currentRel !== finalUrl && !CONFIG.DRY_RUN) {
              await query("UPDATE trip_images SET image_url = ? WHERE id = ?", [
                finalUrl,
                image.id,
              ]);
              console.log(
                `  ✓ Updated DB for trip_image ${image.id} -> ${finalUrl}`
              );
            }
            stats.tripImages.skipped++;
            return;
          } catch (err) {
            // final missing
          }

          const tempPath = path.join(
            tripDir,
            `${image.display_order}_temp.jpg`
          );
          let downloadResult;
          try {
            await fs.access(tempPath);
            console.log(`  ⏭️  Temp file already exists, using: ${tempPath}`);
            downloadResult = { success: true };
          } catch (err) {
            downloadResult = await downloadImage(image.image_url, tempPath);
          }

          if (!downloadResult.success) {
            stats.tripImages.failed++;
            failedDownloads.push({
              table: "trip_images",
              id: image.id,
              field: "image_url",
              url: image.image_url,
              reason: downloadResult.reason,
            });
            return;
          }

          const resizeRes = await resizeSingle(tempPath, finalPath, 1600);
          if (!resizeRes.success) {
            stats.tripImages.failed++;
            failedDownloads.push({
              table: "trip_images",
              id: image.id,
              field: "image_url",
              url: image.image_url,
              reason: resizeRes.reason,
            });
            return;
          }

          if (!CONFIG.DRY_RUN) {
            await query("UPDATE trip_images SET image_url = ? WHERE id = ?", [
              finalUrl,
              image.id,
            ]);
            console.log(
              `  ✓ Updated DB for trip_image ${image.id} -> ${finalUrl}`
            );
          }

          stats.tripImages.success++;
        } catch (error) {
          stats.tripImages.failed++;
          failedDownloads.push({
            table: "trip_images",
            id: image.id,
            field: "image_url",
            url: image.image_url,
            reason: error.message,
          });
        }
      },
      CONFIG.MAX_CONCURRENT_DOWNLOADS
    );

    console.log(
      `  ✓ Success: ${stats.tripImages.success}, Failed: ${stats.tripImages.failed}`
    );
  } catch (error) {
    console.log(`  ⚠ trip_images table doesn't exist, skipping`);
  }
}

/**
 * Migrate place photos
 */
async function migratePlacePhotos(connection) {
  console.log("\n📍 Migrating place photos...");

  const [photos] = await connection.query(
    "SELECT id, place_id, url_small, url_medium, url_large, photo_order FROM place_photos"
  );
  stats.placePhotos.total = photos.length * 3; // 3 sizes per photo
  console.log(
    `  Found ${photos.length} place photos (${stats.placePhotos.total} total files)`
  );

  await pMap(
    photos,
    async (photo) => {
      const placeDir = path.join(
        CONFIG.NEW_IMAGE_DIR,
        "places",
        photo.place_id.toString()
      );
    },
    CONFIG.MAX_CONCURRENT_DOWNLOADS
  );
  await pMap(
    photos,
    async (photo) => {
      const placeDir = path.join(
        CONFIG.NEW_IMAGE_DIR,
        "places",
        photo.place_id.toString()
      );

      // Only process if we have a large URL
      if (!photo.url_large) return;

      // Skip if not http/https URL (already local)
      if (
        !photo.url_large.startsWith("http://") &&
        !photo.url_large.startsWith("https://")
      ) {
        stats.placePhotos.skipped += 3; // Count all 3 sizes as skipped
        return;
      }

      // Download large image once
      const tempPath = path.join(placeDir, `${photo.photo_order}_temp.jpg`);

      // Check if temp file already exists
      let largeResult;
      try {
        await fs.access(tempPath);
        console.log(`  ⏭️  Temp file already exists, using: ${tempPath}`);
        largeResult = { success: true };
      } catch (err) {
        // Temp file doesn't exist, download it
        largeResult = await downloadImage(photo.url_large, tempPath);
      }

      if (largeResult.success) {
        // Resize to create all sizes
        const sizes = [
          { name: "small", maxWidth: 400 },
          { name: "medium", maxWidth: 800 },
          { name: "large", maxWidth: 1600 },
        ];

        const basePath = path.join(placeDir, `${photo.photo_order}`);
        const resizeResult = await resizeImage(tempPath, basePath, sizes);

        if (resizeResult.success) {
          // Build relative URLs
          const smallUrl = `/images/places/${photo.place_id}/${photo.photo_order}_small.jpg`;
          const mediumUrl = `/images/places/${photo.place_id}/${photo.photo_order}_medium.jpg`;
          const largeUrl = `/images/places/${photo.place_id}/${photo.photo_order}_large.jpg`;

          if (!CONFIG.DRY_RUN) {
            try {
              await query(
                "UPDATE place_photos SET url_small = ?, url_medium = ?, url_large = ? WHERE id = ?",
                [smallUrl, mediumUrl, largeUrl, photo.id]
              );
              console.log(`    ✓ Updated DB place_photos.id=${photo.id}`);
            } catch (err) {
              console.error(
                `    ✗ DB update failed for place_photos.id=${photo.id}: ${err.message}`
              );
              stats.placePhotos.failed += 3;
              failedDownloads.push({
                table: "place_photos",
                id: photo.id,
                field: "all_sizes",
                url: photo.url_large,
                reason: err.message,
              });
              return;
            }
          } else {
            console.log(
              `    ⚠ DRY RUN - would update place_photos.id=${photo.id}`
            );
          }

          stats.placePhotos.success += 3; // Count all 3 sizes
        } else {
          stats.placePhotos.failed += 3;
          failedDownloads.push({
            table: "place_photos",
            id: photo.id,
            field: "all_sizes",
            url: photo.url_large,
            reason: resizeResult.reason,
          });
        }
      } else {
        stats.placePhotos.failed += 3;
        failedDownloads.push({
          table: "place_photos",
          id: photo.id,
          field: "url_large",
          url: photo.url_large,
          reason: largeResult.reason,
        });
      }
    },
    CONFIG.MAX_CONCURRENT_DOWNLOADS
  );

  console.log(
    `  ✓ Success: ${stats.placePhotos.success}, Failed: ${stats.placePhotos.failed}, Skipped: ${stats.placePhotos.skipped}`
  );
}

/**
 * Migrate city photos
 */
async function migrateCityPhotos(connection) {
  console.log("\n🏙️  Migrating city photos...");

  const [photos] = await connection.query(
    "SELECT id, city_id, url_small, url_medium, url_large, photo_order FROM city_photos"
  );
  stats.cityPhotos.total = photos.length * 3; // 3 sizes per photo
  console.log(
    `  Found ${photos.length} city photos (${stats.cityPhotos.total} total files)`
  );

  await pMap(
    photos,
    async (photo) => {
      const cityDir = path.join(
        CONFIG.NEW_IMAGE_DIR,
        "cities",
        photo.city_id.toString()
      );
    },
    CONFIG.MAX_CONCURRENT_DOWNLOADS
  );
  await pMap(
    photos,
    async (photo) => {
      const cityDir = path.join(
        CONFIG.NEW_IMAGE_DIR,
        "cities",
        photo.city_id.toString()
      );

      // Only process if we have a large URL
      if (!photo.url_large) return;

      // Skip if not http/https URL (already local)
      if (
        !photo.url_large.startsWith("http://") &&
        !photo.url_large.startsWith("https://")
      ) {
        stats.cityPhotos.skipped += 3; // Count all 3 sizes as skipped
        return;
      }

      // Download large image once
      const tempPath = path.join(cityDir, `${photo.photo_order}_temp.jpg`);

      // Check if temp file already exists
      let largeResult;
      try {
        await fs.access(tempPath);
        console.log(`  ⏭️  Temp file already exists, using: ${tempPath}`);
        largeResult = { success: true };
      } catch (err) {
        // Temp file doesn't exist, download it
        largeResult = await downloadImage(photo.url_large, tempPath);
      }

      if (largeResult.success) {
        // Resize to create all sizes
        const sizes = [
          { name: "small", maxWidth: 400 },
          { name: "medium", maxWidth: 800 },
          { name: "large", maxWidth: 1600 },
        ];

        const basePath = path.join(cityDir, `${photo.photo_order}`);
        const resizeResult = await resizeImage(tempPath, basePath, sizes);

        if (resizeResult.success) {
          const smallUrl = `/images/cities/${photo.city_id}/${photo.photo_order}_small.jpg`;
          const mediumUrl = `/images/cities/${photo.city_id}/${photo.photo_order}_medium.jpg`;
          const largeUrl = `/images/cities/${photo.city_id}/${photo.photo_order}_large.jpg`;

          if (!CONFIG.DRY_RUN) {
            try {
              await query(
                "UPDATE city_photos SET url_small = ?, url_medium = ?, url_large = ? WHERE id = ?",
                [smallUrl, mediumUrl, largeUrl, photo.id]
              );
              console.log(`    ✓ Updated DB city_photos.id=${photo.id}`);
            } catch (err) {
              console.error(
                `    ✗ DB update failed for city_photos.id=${photo.id}: ${err.message}`
              );
              stats.cityPhotos.failed += 3;
              failedDownloads.push({
                table: "city_photos",
                id: photo.id,
                field: "all_sizes",
                url: photo.url_large,
                reason: err.message,
              });
              return;
            }
          } else {
            console.log(
              `    ⚠ DRY RUN - would update city_photos.id=${photo.id}`
            );
          }

          stats.cityPhotos.success += 3; // Count all 3 sizes
        } else {
          stats.cityPhotos.failed += 3;
          failedDownloads.push({
            table: "city_photos",
            id: photo.id,
            field: "all_sizes",
            url: photo.url_large,
            reason: resizeResult.reason,
          });
        }
      } else {
        stats.cityPhotos.failed += 3;
        failedDownloads.push({
          table: "city_photos",
          id: photo.id,
          field: "url_large",
          url: photo.url_large,
          reason: largeResult.reason,
        });
      }
    },
    CONFIG.MAX_CONCURRENT_DOWNLOADS
  );

  console.log(
    `  ✓ Success: ${stats.cityPhotos.success}, Failed: ${stats.cityPhotos.failed}, Skipped: ${stats.cityPhotos.skipped}`
  );
}

/**
 * Update database with new URLs
 */
async function updateDatabase(connection) {
  console.log("\n💾 Updating database...");

  if (CONFIG.DRY_RUN) {
    console.log("  ⚠️  DRY RUN MODE - Skipping database updates");
    return;
  }

  try {
    await connection.beginTransaction();

    let updateCount = 0;

    // Update users
    for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
      const [result] = await connection.query(
        "UPDATE users SET photo_url = ? WHERE photo_url = ?",
        [newUrl, oldUrl]
      );
      updateCount += result.affectedRows;
    }
    console.log(`  ✓ Updated ${updateCount} user photos`);

    // Update trips
    updateCount = 0;
    for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
      const [result] = await connection.query(
        "UPDATE trips SET cover_image = ? WHERE cover_image = ?",
        [newUrl, oldUrl]
      );
      updateCount += result.affectedRows;
    }
    console.log(`  ✓ Updated ${updateCount} trip cover images`);

    // Update trip_images (if exists)
    try {
      updateCount = 0;
      for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
        const [result] = await connection.query(
          "UPDATE trip_images SET image_url = ? WHERE image_url = ?",
          [newUrl, oldUrl]
        );
        updateCount += result.affectedRows;
      }
      console.log(`  ✓ Updated ${updateCount} trip images`);
    } catch (err) {
      // Table doesn't exist
    }

    // Update place_photos
    updateCount = 0;
    for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
      const [result] = await connection.query(
        "UPDATE place_photos SET url_small = ? WHERE url_small = ?",
        [newUrl, oldUrl]
      );
      updateCount += result.affectedRows;

      const [result2] = await connection.query(
        "UPDATE place_photos SET url_medium = ? WHERE url_medium = ?",
        [newUrl, oldUrl]
      );
      updateCount += result2.affectedRows;

      const [result3] = await connection.query(
        "UPDATE place_photos SET url_large = ? WHERE url_large = ?",
        [newUrl, oldUrl]
      );
      updateCount += result3.affectedRows;
    }
    console.log(`  ✓ Updated ${updateCount} place photo URLs`);

    // Update city_photos
    updateCount = 0;
    for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
      const [result] = await connection.query(
        "UPDATE city_photos SET url_small = ? WHERE url_small = ?",
        [newUrl, oldUrl]
      );
      updateCount += result.affectedRows;

      const [result2] = await connection.query(
        "UPDATE city_photos SET url_medium = ? WHERE url_medium = ?",
        [newUrl, oldUrl]
      );
      updateCount += result2.affectedRows;

      const [result3] = await connection.query(
        "UPDATE city_photos SET url_large = ? WHERE url_large = ?",
        [newUrl, oldUrl]
      );
      updateCount += result3.affectedRows;
    }
    console.log(`  ✓ Updated ${updateCount} city photo URLs`);

    await connection.commit();
    console.log("  ✓ Database transaction committed");
  } catch (error) {
    await connection.rollback();
    console.error("  ✗ Database update failed, rolled back:", error.message);
    throw error;
  }
}

/**
 * Save migration logs
 */
async function saveLogs() {
  console.log("\n📝 Saving migration logs...");

  // Save URL mapping
  const mappingPath = path.join(
    CONFIG.BACKUP_DIR,
    `url-mapping-${timestamp}.json`
  );
  await fs.writeFile(mappingPath, JSON.stringify(urlMapping, null, 2));
  console.log(`  ✓ URL mapping saved to: ${mappingPath}`);

  // Save migration log
  const logPath = path.join(CONFIG.BACKUP_DIR, `migration-${timestamp}.log`);
  const logContent = `
=== IMAGE MIGRATION LOG ===
Timestamp: ${new Date().toISOString()}
Dry Run: ${CONFIG.DRY_RUN}

STATISTICS:
Users:        ${stats.users.success}/${stats.users.total} successful (${
    stats.users.failed
  } failed, ${stats.users.skipped} skipped)
Trips:        ${stats.trips.success}/${stats.trips.total} successful (${
    stats.trips.failed
  } failed, ${stats.trips.skipped} skipped)
Trip Images:  ${stats.tripImages.success}/${
    stats.tripImages.total
  } successful (${stats.tripImages.failed} failed)
Place Photos: ${stats.placePhotos.success}/${
    stats.placePhotos.total
  } successful (${stats.placePhotos.failed} failed)
City Photos:  ${stats.cityPhotos.success}/${
    stats.cityPhotos.total
  } successful (${stats.cityPhotos.failed} failed)

Total Successful: ${Object.values(stats).reduce((sum, s) => sum + s.success, 0)}
Total Failed:     ${Object.values(stats).reduce((sum, s) => sum + s.failed, 0)}
Total Skipped:    ${Object.values(stats).reduce((sum, s) => sum + s.skipped, 0)}

FAILED DOWNLOADS:
${
  failedDownloads.length === 0
    ? "None"
    : failedDownloads
        .map(
          (f) =>
            `- ${f.table}.${f.field} (ID: ${f.id}): ${f.url}\n  Reason: ${f.reason}`
        )
        .join("\n")
}

URL MAPPINGS: ${Object.keys(urlMapping).length} total
First 10 samples:
${Object.entries(urlMapping)
  .slice(0, 10)
  .map(([old, new_]) => `${old} -> ${new_}`)
  .join("\n")}
`;

  await fs.writeFile(logPath, logContent);
  console.log(`  ✓ Migration log saved to: ${logPath}`);
}

/**
 * Check and fetch missing city photos from Google Maps
 */
async function fetchMissingCityPhotos(connection) {
  console.log("\n🏙️  Checking for cities without photos...");

  try {
    // Get cities that don't have photos
    const [citiesWithoutPhotos] = await connection.query(`
      SELECT c.id, c.name, c.state, c.google_maps_id, co.name as country_name
      FROM cities c
      LEFT JOIN city_photos cp ON c.id = cp.city_id
      LEFT JOIN countries co ON c.country_id = co.id
      WHERE c.google_maps_id IS NOT NULL 
        AND cp.id IS NULL
      LIMIT 50
    `);

    if (citiesWithoutPhotos.length === 0) {
      console.log("  ✓ All cities have photos");
      return;
    }

    console.log(`  Found ${citiesWithoutPhotos.length} cities without photos`);

    const {
      getCityDetailsWithPhotos,
    } = require("../src/services/googleMapsService");

    for (const city of citiesWithoutPhotos) {
      console.log(`  Fetching photos for: ${city.name}, ${city.country_name}`);

      try {
        const details = await getCityDetailsWithPhotos(city.google_maps_id);

        if (details?.photos && details.photos.length > 0) {
          const photoRef = details.photos[0].photo_reference;

          const cityDir = path.join(
            CONFIG.NEW_IMAGE_DIR,
            "cities",
            city.id.toString()
          );
          await fs.mkdir(cityDir, { recursive: true });

          // Download large image once
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photoRef}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
          const tempPath = path.join(cityDir, `0_temp.jpg`);

          // Check if temp file already exists
          let downloadResult;
          try {
            await fs.access(tempPath);
            console.log(`    ⏭️  Temp file already exists, using: ${tempPath}`);
            downloadResult = { success: true };
          } catch (err) {
            // Temp file doesn't exist, download it
            downloadResult = await downloadImage(photoUrl, tempPath);
          }

          let allSuccess = false;
          const photoUrls = {};

          if (downloadResult.success) {
            // Resize to create all sizes
            const sizes = [
              { name: "small", maxWidth: 400 },
              { name: "medium", maxWidth: 800 },
              { name: "large", maxWidth: 1600 },
            ];

            const basePath = path.join(cityDir, `0`);
            const resizeResult = await resizeImage(tempPath, basePath, sizes);

            if (resizeResult.success) {
              photoUrls.url_small = `/images/cities/${city.id}/0_small.jpg`;
              photoUrls.url_medium = `/images/cities/${city.id}/0_medium.jpg`;
              photoUrls.url_large = `/images/cities/${city.id}/0_large.jpg`;
              allSuccess = true;
            }
          }

          if (allSuccess && !CONFIG.DRY_RUN) {
            // Insert photo record into database
            await connection.query(
              "INSERT INTO city_photos (city_id, url_small, url_medium, url_large, photo_order, google_photo_reference, created_at) VALUES (?, ?, ?, ?, 0, ?, NOW())",
              [
                city.id,
                photoUrls.url_small,
                photoUrls.url_medium,
                photoUrls.url_large,
                photoRef,
              ]
            );
            console.log(`    ✓ Added photos for ${city.name}`);
            stats.cityPhotos.success++;
          }
        } else {
          console.log(`    ⚠ No photos available for ${city.name}`);
        }

        // Rate limiting
        await sleep(200);
      } catch (error) {
        console.error(
          `    ✗ Failed to fetch photos for ${city.name}:`,
          error.message
        );
        stats.cityPhotos.failed++;
      }
    }
  } catch (error) {
    console.error("  ✗ Error checking city photos:", error.message);
  }
}

/**
 * Check and fetch missing place photos from Google Maps
 */
async function fetchMissingPlacePhotos(connection) {
  console.log("\n📍 Checking for places without photos...");

  try {
    // Get places that don't have photos
    const [placesWithoutPhotos] = await connection.query(`
      SELECT p.id, p.name, p.google_place_id, p.city_id
      FROM places p
      LEFT JOIN place_photos pp ON p.id = pp.place_id
      WHERE p.google_place_id IS NOT NULL 
        AND pp.id IS NULL
      LIMIT 50
    `);

    if (placesWithoutPhotos.length === 0) {
      console.log("  ✓ All places have photos");
      return;
    }

    console.log(`  Found ${placesWithoutPhotos.length} places without photos`);

    const {
      getPlaceDetailsWithPhotos,
    } = require("../src/services/googleMapsService");

    for (const place of placesWithoutPhotos) {
      console.log(`  Fetching photos for: ${place.name}`);

      try {
        const details = await getPlaceDetailsWithPhotos(place.google_place_id);

        if (details?.photos && details.photos.length > 0) {
          const photoRef = details.photos[0].photo_reference;

          const placeDir = path.join(
            CONFIG.NEW_IMAGE_DIR,
            "places",
            place.id.toString()
          );
          await fs.mkdir(placeDir, { recursive: true });

          // Download large image once
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photoRef}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
          const tempPath = path.join(placeDir, `0_temp.jpg`);

          // Check if temp file already exists
          let downloadResult;
          try {
            await fs.access(tempPath);
            console.log(`    ⏭️  Temp file already exists, using: ${tempPath}`);
            downloadResult = { success: true };
          } catch (err) {
            // Temp file doesn't exist, download it
            downloadResult = await downloadImage(photoUrl, tempPath);
          }

          let allSuccess = false;
          const photoUrls = {};

          if (downloadResult.success) {
            // Resize to create all sizes
            const sizes = [
              { name: "small", maxWidth: 400 },
              { name: "medium", maxWidth: 800 },
              { name: "large", maxWidth: 1600 },
            ];

            const basePath = path.join(placeDir, `0`);
            const resizeResult = await resizeImage(tempPath, basePath, sizes);

            if (resizeResult.success) {
              photoUrls.url_small = `/images/places/${place.id}/0_small.jpg`;
              photoUrls.url_medium = `/images/places/${place.id}/0_medium.jpg`;
              photoUrls.url_large = `/images/places/${place.id}/0_large.jpg`;
              allSuccess = true;
            }
          }

          if (allSuccess && !CONFIG.DRY_RUN) {
            // Insert photo record into database
            await connection.query(
              "INSERT INTO place_photos (place_id, url_small, url_medium, url_large, photo_order, google_photo_reference, created_at) VALUES (?, ?, ?, ?, 0, ?, NOW())",
              [
                place.id,
                photoUrls.url_small,
                photoUrls.url_medium,
                photoUrls.url_large,
                photoRef,
              ]
            );
            console.log(`    ✓ Added photos for ${place.name}`);
            stats.placePhotos.success++;
          }
        } else {
          console.log(`    ⚠ No photos available for ${place.name}`);
        }

        // Rate limiting
        await sleep(200);
      } catch (error) {
        console.error(
          `    ✗ Failed to fetch photos for ${place.name}:`,
          error.message
        );
        stats.placePhotos.failed++;
      }
    }
  } catch (error) {
    console.error("  ✗ Error checking place photos:", error.message);
  }
}

/**
 * Clean up all temporary files
 */
async function cleanupTempFiles() {
  console.log("\n\ud83e\uddf9 Cleaning up temporary files...");

  try {
    const placesDir = path.join(CONFIG.NEW_IMAGE_DIR, "places");
    const citiesDir = path.join(CONFIG.NEW_IMAGE_DIR, "cities");

    let deletedCount = 0;

    // Clean places temp files
    try {
      const placeFolders = await fs.readdir(placesDir);
      for (const folder of placeFolders) {
        const folderPath = path.join(placesDir, folder);
        const stats = await fs.stat(folderPath);
        if (stats.isDirectory()) {
          const files = await fs.readdir(folderPath);
          for (const file of files) {
            if (file.includes("_temp.jpg")) {
              await fs.unlink(path.join(folderPath, file));
              deletedCount++;
            }
          }
        }
      }
    } catch (err) {
      // Directory might not exist
    }

    // Clean cities temp files
    try {
      const cityFolders = await fs.readdir(citiesDir);
      for (const folder of cityFolders) {
        const folderPath = path.join(citiesDir, folder);
        const stats = await fs.stat(folderPath);
        if (stats.isDirectory()) {
          const files = await fs.readdir(folderPath);
          for (const file of files) {
            if (file.includes("_temp.jpg")) {
              await fs.unlink(path.join(folderPath, file));
              deletedCount++;
            }
          }
        }
      }
    } catch (err) {
      // Directory might not exist
    }

    console.log(`  \u2713 Deleted ${deletedCount} temporary files`);
  } catch (error) {
    console.error("  \u2717 Error cleaning temp files:", error.message);
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log("\n🚀 IMAGE MIGRATION SCRIPT");
  console.log("=======================\n");
  console.log(
    `Mode: ${CONFIG.DRY_RUN ? "DRY RUN (no database updates)" : "PRODUCTION"}`
  );
  console.log(`Image Directory: ${CONFIG.NEW_IMAGE_DIR}`);
  console.log(`Backup Directory: ${CONFIG.BACKUP_DIR}`);

  const connection = await getConnection();

  try {
    // Create directories
    await fs.mkdir(path.join(CONFIG.NEW_IMAGE_DIR, "users"), {
      recursive: true,
    });
    await fs.mkdir(path.join(CONFIG.NEW_IMAGE_DIR, "trips"), {
      recursive: true,
    });
    await fs.mkdir(path.join(CONFIG.NEW_IMAGE_DIR, "places"), {
      recursive: true,
    });
    await fs.mkdir(path.join(CONFIG.NEW_IMAGE_DIR, "cities"), {
      recursive: true,
    });
    await fs.mkdir(CONFIG.BACKUP_DIR, { recursive: true });

    // Create backup
    await createBackup(connection);

    // Fetch missing photos from Google Maps FIRST
    await fetchMissingCityPhotos(connection);
    await fetchMissingPlacePhotos(connection);

    // Then migrate all images (including newly fetched ones)
    await migrateUsers(connection);
    await migrateTrips(connection);
    await migrateTripImages(connection);
    await migratePlacePhotos(connection);
    await migrateCityPhotos(connection);

    // Update database
    await updateDatabase(connection);

    // Save logs
    await saveLogs();

    // Clean up all temp files
    await cleanupTempFiles();

    console.log("\n✅ MIGRATION COMPLETED SUCCESSFULLY!\n");

    const totalSuccess = Object.values(stats).reduce(
      (sum, s) => sum + s.success,
      0
    );
    const totalFailed = Object.values(stats).reduce(
      (sum, s) => sum + s.failed,
      0
    );
    console.log(`Total images migrated: ${totalSuccess}`);
    console.log(`Total failures: ${totalFailed}`);

    if (failedDownloads.length > 0) {
      console.log(
        `\n⚠️  ${failedDownloads.length} images failed to download. Check the log file for details.`
      );
    }
  } catch (error) {
    console.error("\n❌ MIGRATION FAILED:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    connection.release();
  }
}

// Run migration
main();
