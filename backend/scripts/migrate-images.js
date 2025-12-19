const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { getConnection } = require('../src/database/connection');

// Configuration
const CONFIG = {
  NEW_IMAGE_DIR: process.env.NEW_IMAGE_DIR || path.join(__dirname, '..', 'images'),
  BACKUP_DIR: process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups'),
  MAX_CONCURRENT_DOWNLOADS: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS) || 5,
  RETRY_ATTEMPTS: parseInt(process.env.RETRY_ATTEMPTS) || 3,
  DRY_RUN: process.argv.includes('--dry-run'),
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
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
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Download image with retry logic
 */
async function downloadImage(url, outputPath, retries = CONFIG.RETRY_ATTEMPTS) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Skip if URL is null, empty, or invalid
      if (!url || url.trim() === '' || url === 'null') {
        return { success: false, reason: 'Invalid URL' };
      }

      // Handle relative URLs (local uploads)
      let downloadUrl = url;
      if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
        downloadUrl = `${CONFIG.BASE_URL}/${url.replace(/^\//, '')}`;
      }

      console.log(`  [${attempt}/${retries}] Downloading: ${downloadUrl.substring(0, 80)}...`);

      const response = await axios({
        method: 'GET',
        url: downloadUrl,
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
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
        console.log(`  Retrying in ${delay/1000}s...`);
        await sleep(delay);
      } else {
        return {
          success: false,
          reason: error.message,
          url: url
        };
      }
    }
  }
}

/**
 * Get file extension from URL or content type
 */
function getFileExtension(url, contentType = '') {
  // Try to get from URL
  const urlExt = path.extname(url).split('?')[0].toLowerCase();
  if (urlExt && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(urlExt)) {
    return urlExt;
  }

  // Try to get from content type
  if (contentType) {
    const typeMap = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp'
    };
    return typeMap[contentType.toLowerCase()] || '.jpg';
  }

  return '.jpg'; // Default
}

/**
 * Create database backup
 */
async function createBackup(connection) {
  console.log('\n📦 Creating database backup...');

  const backup = {
    timestamp: new Date().toISOString(),
    tables: {}
  };

  try {
    // Backup users
    const [users] = await connection.query('SELECT id, photo_url FROM users WHERE photo_url IS NOT NULL');
    backup.tables.users = users;
    console.log(`  ✓ Backed up ${users.length} users`);

    // Backup trips
    const [trips] = await connection.query('SELECT id, cover_image FROM trips WHERE cover_image IS NOT NULL');
    backup.tables.trips = trips;
    console.log(`  ✓ Backed up ${trips.length} trips`);

    // Backup trip_images (if table exists)
    try {
      const [tripImages] = await connection.query('SELECT id, trip_id, image_url, display_order FROM trip_images WHERE image_url IS NOT NULL');
      backup.tables.trip_images = tripImages;
      console.log(`  ✓ Backed up ${tripImages.length} trip images`);
    } catch (err) {
      console.log(`  ⚠ trip_images table doesn't exist, skipping`);
      backup.tables.trip_images = [];
    }

    // Backup place_photos
    const [placePhotos] = await connection.query('SELECT id, place_id, url_small, url_medium, url_large, photo_order FROM place_photos');
    backup.tables.place_photos = placePhotos;
    console.log(`  ✓ Backed up ${placePhotos.length} place photos`);

    // Backup city_photos
    const [cityPhotos] = await connection.query('SELECT id, city_id, url_small, url_medium, url_large, photo_order FROM city_photos');
    backup.tables.city_photos = cityPhotos;
    console.log(`  ✓ Backed up ${cityPhotos.length} city photos`);

    // Save backup to file
    const backupPath = path.join(CONFIG.BACKUP_DIR, `backup-${timestamp}.json`);
    await fs.mkdir(CONFIG.BACKUP_DIR, { recursive: true });
    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
    console.log(`  ✓ Backup saved to: ${backupPath}\n`);

    return backup;
  } catch (error) {
    console.error('  ✗ Backup failed:', error.message);
    throw error;
  }
}

/**
 * Migrate user photos
 */
async function migrateUsers(connection) {
  console.log('\n👤 Migrating user photos...');

  const [users] = await connection.query('SELECT id, photo_url FROM users WHERE photo_url IS NOT NULL AND photo_url != ""');
  stats.users.total = users.length;
  console.log(`  Found ${users.length} users with photos`);

  for (const user of users) {
    const ext = getFileExtension(user.photo_url);
    const newPath = path.join(CONFIG.NEW_IMAGE_DIR, 'users', `${user.id}${ext}`);
    const newUrl = `/images/users/${user.id}${ext}`;

    const result = await downloadImage(user.photo_url, newPath);

    if (result.success) {
      urlMapping[user.photo_url] = newUrl;
      stats.users.success++;
    } else {
      stats.users.failed++;
      failedDownloads.push({
        table: 'users',
        id: user.id,
        field: 'photo_url',
        url: user.photo_url,
        reason: result.reason
      });
    }
  }

  console.log(`  ✓ Success: ${stats.users.success}, Failed: ${stats.users.failed}`);
}

/**
 * Migrate trip cover images
 */
async function migrateTrips(connection) {
  console.log('\n🗺️  Migrating trip cover images...');

  const [trips] = await connection.query('SELECT id, cover_image FROM trips WHERE cover_image IS NOT NULL AND cover_image != ""');
  stats.trips.total = trips.length;
  console.log(`  Found ${trips.length} trips with cover images`);

  for (const trip of trips) {
    // Skip unsplash URLs (these are dynamic/generic)
    if (trip.cover_image.includes('unsplash.com')) {
      stats.trips.skipped++;
      continue;
    }

    const ext = getFileExtension(trip.cover_image);
    const tripDir = path.join(CONFIG.NEW_IMAGE_DIR, 'trips', trip.id);
    const newPath = path.join(tripDir, `cover${ext}`);
    const newUrl = `/images/trips/${trip.id}/cover${ext}`;

    const result = await downloadImage(trip.cover_image, newPath);

    if (result.success) {
      urlMapping[trip.cover_image] = newUrl;
      stats.trips.success++;
    } else {
      stats.trips.failed++;
      failedDownloads.push({
        table: 'trips',
        id: trip.id,
        field: 'cover_image',
        url: trip.cover_image,
        reason: result.reason
      });
    }
  }

  console.log(`  ✓ Success: ${stats.trips.success}, Failed: ${stats.trips.failed}, Skipped: ${stats.trips.skipped}`);
}

/**
 * Migrate trip images
 */
async function migrateTripImages(connection) {
  console.log('\n📸 Migrating trip images...');

  try {
    const [tripImages] = await connection.query('SELECT id, trip_id, image_url, display_order FROM trip_images WHERE image_url IS NOT NULL AND image_url != ""');
    stats.tripImages.total = tripImages.length;
    console.log(`  Found ${tripImages.length} trip images`);

    for (const image of tripImages) {
      const ext = getFileExtension(image.image_url);
      const tripDir = path.join(CONFIG.NEW_IMAGE_DIR, 'trips', image.trip_id);
      const newPath = path.join(tripDir, `${image.display_order}${ext}`);
      const newUrl = `/images/trips/${image.trip_id}/${image.display_order}${ext}`;

      const result = await downloadImage(image.image_url, newPath);

      if (result.success) {
        urlMapping[image.image_url] = newUrl;
        stats.tripImages.success++;
      } else {
        stats.tripImages.failed++;
        failedDownloads.push({
          table: 'trip_images',
          id: image.id,
          field: 'image_url',
          url: image.image_url,
          reason: result.reason
        });
      }
    }

    console.log(`  ✓ Success: ${stats.tripImages.success}, Failed: ${stats.tripImages.failed}`);
  } catch (error) {
    console.log(`  ⚠ trip_images table doesn't exist, skipping`);
  }
}

/**
 * Migrate place photos
 */
async function migratePlacePhotos(connection) {
  console.log('\n📍 Migrating place photos...');

  const [photos] = await connection.query('SELECT id, place_id, url_small, url_medium, url_large, photo_order FROM place_photos');
  stats.placePhotos.total = photos.length * 3; // 3 sizes per photo
  console.log(`  Found ${photos.length} place photos (${stats.placePhotos.total} total files)`);

  for (const photo of photos) {
    const placeDir = path.join(CONFIG.NEW_IMAGE_DIR, 'places', photo.place_id.toString());

    // Download small
    if (photo.url_small) {
      const ext = getFileExtension(photo.url_small);
      const newPath = path.join(placeDir, `${photo.photo_order}_small${ext}`);
      const newUrl = `/images/places/${photo.place_id}/${photo.photo_order}_small${ext}`;

      const result = await downloadImage(photo.url_small, newPath);
      if (result.success) {
        urlMapping[photo.url_small] = newUrl;
        stats.placePhotos.success++;
      } else {
        stats.placePhotos.failed++;
        failedDownloads.push({
          table: 'place_photos',
          id: photo.id,
          field: 'url_small',
          url: photo.url_small,
          reason: result.reason
        });
      }
    }

    // Download medium
    if (photo.url_medium) {
      const ext = getFileExtension(photo.url_medium);
      const newPath = path.join(placeDir, `${photo.photo_order}_medium${ext}`);
      const newUrl = `/images/places/${photo.place_id}/${photo.photo_order}_medium${ext}`;

      const result = await downloadImage(photo.url_medium, newPath);
      if (result.success) {
        urlMapping[photo.url_medium] = newUrl;
        stats.placePhotos.success++;
      } else {
        stats.placePhotos.failed++;
        failedDownloads.push({
          table: 'place_photos',
          id: photo.id,
          field: 'url_medium',
          url: photo.url_medium,
          reason: result.reason
        });
      }
    }

    // Download large
    if (photo.url_large) {
      const ext = getFileExtension(photo.url_large);
      const newPath = path.join(placeDir, `${photo.photo_order}_large${ext}`);
      const newUrl = `/images/places/${photo.place_id}/${photo.photo_order}_large${ext}`;

      const result = await downloadImage(photo.url_large, newPath);
      if (result.success) {
        urlMapping[photo.url_large] = newUrl;
        stats.placePhotos.success++;
      } else {
        stats.placePhotos.failed++;
        failedDownloads.push({
          table: 'place_photos',
          id: photo.id,
          field: 'url_large',
          url: photo.url_large,
          reason: result.reason
        });
      }
    }
  }

  console.log(`  ✓ Success: ${stats.placePhotos.success}, Failed: ${stats.placePhotos.failed}`);
}

/**
 * Migrate city photos
 */
async function migrateCityPhotos(connection) {
  console.log('\n🏙️  Migrating city photos...');

  const [photos] = await connection.query('SELECT id, city_id, url_small, url_medium, url_large, photo_order FROM city_photos');
  stats.cityPhotos.total = photos.length * 3; // 3 sizes per photo
  console.log(`  Found ${photos.length} city photos (${stats.cityPhotos.total} total files)`);

  for (const photo of photos) {
    const cityDir = path.join(CONFIG.NEW_IMAGE_DIR, 'cities', photo.city_id.toString());

    // Download small
    if (photo.url_small) {
      const ext = getFileExtension(photo.url_small);
      const newPath = path.join(cityDir, `${photo.photo_order}_small${ext}`);
      const newUrl = `/images/cities/${photo.city_id}/${photo.photo_order}_small${ext}`;

      const result = await downloadImage(photo.url_small, newPath);
      if (result.success) {
        urlMapping[photo.url_small] = newUrl;
        stats.cityPhotos.success++;
      } else {
        stats.cityPhotos.failed++;
        failedDownloads.push({
          table: 'city_photos',
          id: photo.id,
          field: 'url_small',
          url: photo.url_small,
          reason: result.reason
        });
      }
    }

    // Download medium
    if (photo.url_medium) {
      const ext = getFileExtension(photo.url_medium);
      const newPath = path.join(cityDir, `${photo.photo_order}_medium${ext}`);
      const newUrl = `/images/cities/${photo.city_id}/${photo.photo_order}_medium${ext}`;

      const result = await downloadImage(photo.url_medium, newPath);
      if (result.success) {
        urlMapping[photo.url_medium] = newUrl;
        stats.cityPhotos.success++;
      } else {
        stats.cityPhotos.failed++;
        failedDownloads.push({
          table: 'city_photos',
          id: photo.id,
          field: 'url_medium',
          url: photo.url_medium,
          reason: result.reason
        });
      }
    }

    // Download large
    if (photo.url_large) {
      const ext = getFileExtension(photo.url_large);
      const newPath = path.join(cityDir, `${photo.photo_order}_large${ext}`);
      const newUrl = `/images/cities/${photo.city_id}/${photo.photo_order}_large${ext}`;

      const result = await downloadImage(photo.url_large, newPath);
      if (result.success) {
        urlMapping[photo.url_large] = newUrl;
        stats.cityPhotos.success++;
      } else {
        stats.cityPhotos.failed++;
        failedDownloads.push({
          table: 'city_photos',
          id: photo.id,
          field: 'url_large',
          url: photo.url_large,
          reason: result.reason
        });
      }
    }
  }

  console.log(`  ✓ Success: ${stats.cityPhotos.success}, Failed: ${stats.cityPhotos.failed}`);
}

/**
 * Update database with new URLs
 */
async function updateDatabase(connection) {
  console.log('\n💾 Updating database...');

  if (CONFIG.DRY_RUN) {
    console.log('  ⚠️  DRY RUN MODE - Skipping database updates');
    return;
  }

  try {
    await connection.beginTransaction();

    let updateCount = 0;

    // Update users
    for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
      const [result] = await connection.query(
        'UPDATE users SET photo_url = ? WHERE photo_url = ?',
        [newUrl, oldUrl]
      );
      updateCount += result.affectedRows;
    }
    console.log(`  ✓ Updated ${updateCount} user photos`);

    // Update trips
    updateCount = 0;
    for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
      const [result] = await connection.query(
        'UPDATE trips SET cover_image = ? WHERE cover_image = ?',
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
          'UPDATE trip_images SET image_url = ? WHERE image_url = ?',
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
        'UPDATE place_photos SET url_small = ? WHERE url_small = ?',
        [newUrl, oldUrl]
      );
      updateCount += result.affectedRows;

      const [result2] = await connection.query(
        'UPDATE place_photos SET url_medium = ? WHERE url_medium = ?',
        [newUrl, oldUrl]
      );
      updateCount += result2.affectedRows;

      const [result3] = await connection.query(
        'UPDATE place_photos SET url_large = ? WHERE url_large = ?',
        [newUrl, oldUrl]
      );
      updateCount += result3.affectedRows;
    }
    console.log(`  ✓ Updated ${updateCount} place photo URLs`);

    // Update city_photos
    updateCount = 0;
    for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
      const [result] = await connection.query(
        'UPDATE city_photos SET url_small = ? WHERE url_small = ?',
        [newUrl, oldUrl]
      );
      updateCount += result.affectedRows;

      const [result2] = await connection.query(
        'UPDATE city_photos SET url_medium = ? WHERE url_medium = ?',
        [newUrl, oldUrl]
      );
      updateCount += result2.affectedRows;

      const [result3] = await connection.query(
        'UPDATE city_photos SET url_large = ? WHERE url_large = ?',
        [newUrl, oldUrl]
      );
      updateCount += result3.affectedRows;
    }
    console.log(`  ✓ Updated ${updateCount} city photo URLs`);

    await connection.commit();
    console.log('  ✓ Database transaction committed');

  } catch (error) {
    await connection.rollback();
    console.error('  ✗ Database update failed, rolled back:', error.message);
    throw error;
  }
}

/**
 * Save migration logs
 */
async function saveLogs() {
  console.log('\n📝 Saving migration logs...');

  // Save URL mapping
  const mappingPath = path.join(CONFIG.BACKUP_DIR, `url-mapping-${timestamp}.json`);
  await fs.writeFile(mappingPath, JSON.stringify(urlMapping, null, 2));
  console.log(`  ✓ URL mapping saved to: ${mappingPath}`);

  // Save migration log
  const logPath = path.join(CONFIG.BACKUP_DIR, `migration-${timestamp}.log`);
  const logContent = `
=== IMAGE MIGRATION LOG ===
Timestamp: ${new Date().toISOString()}
Dry Run: ${CONFIG.DRY_RUN}

STATISTICS:
Users:        ${stats.users.success}/${stats.users.total} successful (${stats.users.failed} failed, ${stats.users.skipped} skipped)
Trips:        ${stats.trips.success}/${stats.trips.total} successful (${stats.trips.failed} failed, ${stats.trips.skipped} skipped)
Trip Images:  ${stats.tripImages.success}/${stats.tripImages.total} successful (${stats.tripImages.failed} failed)
Place Photos: ${stats.placePhotos.success}/${stats.placePhotos.total} successful (${stats.placePhotos.failed} failed)
City Photos:  ${stats.cityPhotos.success}/${stats.cityPhotos.total} successful (${stats.cityPhotos.failed} failed)

Total Successful: ${Object.values(stats).reduce((sum, s) => sum + s.success, 0)}
Total Failed:     ${Object.values(stats).reduce((sum, s) => sum + s.failed, 0)}
Total Skipped:    ${Object.values(stats).reduce((sum, s) => sum + s.skipped, 0)}

FAILED DOWNLOADS:
${failedDownloads.length === 0 ? 'None' : failedDownloads.map(f =>
  `- ${f.table}.${f.field} (ID: ${f.id}): ${f.url}\n  Reason: ${f.reason}`
).join('\n')}

URL MAPPINGS: ${Object.keys(urlMapping).length} total
First 10 samples:
${Object.entries(urlMapping).slice(0, 10).map(([old, new_]) =>
  `${old} -> ${new_}`
).join('\n')}
`;

  await fs.writeFile(logPath, logContent);
  console.log(`  ✓ Migration log saved to: ${logPath}`);
}

/**
 * Main migration function
 */
async function main() {
  console.log('\n🚀 IMAGE MIGRATION SCRIPT');
  console.log('=======================\n');
  console.log(`Mode: ${CONFIG.DRY_RUN ? 'DRY RUN (no database updates)' : 'PRODUCTION'}`);
  console.log(`Image Directory: ${CONFIG.NEW_IMAGE_DIR}`);
  console.log(`Backup Directory: ${CONFIG.BACKUP_DIR}`);

  const connection = await getConnection();

  try {
    // Create directories
    await fs.mkdir(path.join(CONFIG.NEW_IMAGE_DIR, 'users'), { recursive: true });
    await fs.mkdir(path.join(CONFIG.NEW_IMAGE_DIR, 'trips'), { recursive: true });
    await fs.mkdir(path.join(CONFIG.NEW_IMAGE_DIR, 'places'), { recursive: true });
    await fs.mkdir(path.join(CONFIG.NEW_IMAGE_DIR, 'cities'), { recursive: true });
    await fs.mkdir(CONFIG.BACKUP_DIR, { recursive: true });

    // Create backup
    await createBackup(connection);

    // Migrate all images
    await migrateUsers(connection);
    await migrateTrips(connection);
    await migrateTripImages(connection);
    await migratePlacePhotos(connection);
    await migrateCityPhotos(connection);

    // Update database
    await updateDatabase(connection);

    // Save logs
    await saveLogs();

    console.log('\n✅ MIGRATION COMPLETED SUCCESSFULLY!\n');

    const totalSuccess = Object.values(stats).reduce((sum, s) => sum + s.success, 0);
    const totalFailed = Object.values(stats).reduce((sum, s) => sum + s.failed, 0);
    console.log(`Total images migrated: ${totalSuccess}`);
    console.log(`Total failures: ${totalFailed}`);

    if (failedDownloads.length > 0) {
      console.log(`\n⚠️  ${failedDownloads.length} images failed to download. Check the log file for details.`);
    }

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    connection.release();
  }
}

// Run migration
main();
