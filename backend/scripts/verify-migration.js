const fs = require('fs').promises;
const path = require('path');
const { getConnection } = require('../src/database/connection');

const CONFIG = {
  IMAGE_DIR: process.env.NEW_IMAGE_DIR || path.join(__dirname, '..', 'images'),
  BACKUP_DIR: process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups'),
};

const stats = {
  totalChecks: 0,
  filesExist: 0,
  filesMissing: 0,
  urlsValid: 0,
  urlsInvalid: 0,
};

const issues = [];

/**
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify users table
 */
async function verifyUsers(connection) {
  console.log('\n👤 Verifying user photos...');

  const [users] = await connection.query('SELECT id, photo_url FROM users WHERE photo_url IS NOT NULL AND photo_url != ""');

  for (const user of users) {
    stats.totalChecks++;

    // Check if URL is in new format
    if (user.photo_url.startsWith('/images/users/')) {
      stats.urlsValid++;

      // Check if file exists
      const filePath = path.join(CONFIG.IMAGE_DIR, 'users', path.basename(user.photo_url));
      if (await fileExists(filePath)) {
        stats.filesExist++;
      } else {
        stats.filesMissing++;
        issues.push({
          table: 'users',
          id: user.id,
          field: 'photo_url',
          url: user.photo_url,
          issue: 'File does not exist'
        });
      }
    } else {
      stats.urlsInvalid++;
      issues.push({
        table: 'users',
        id: user.id,
        field: 'photo_url',
        url: user.photo_url,
        issue: 'URL not migrated (still external)'
      });
    }
  }

  console.log(`  Checked ${users.length} users`);
}

/**
 * Verify trips table
 */
async function verifyTrips(connection) {
  console.log('\n🗺️  Verifying trip cover images...');

  const [trips] = await connection.query('SELECT id, cover_image FROM trips WHERE cover_image IS NOT NULL AND cover_image != ""');

  for (const trip of trips) {
    stats.totalChecks++;

    // Skip unsplash URLs (these are not migrated)
    if (trip.cover_image.includes('unsplash.com')) {
      continue;
    }

    // Check if URL is in new format
    if (trip.cover_image.startsWith('/images/trips/')) {
      stats.urlsValid++;

      // Check if file exists
      const relativePath = trip.cover_image.replace('/images/', '');
      const filePath = path.join(CONFIG.IMAGE_DIR, relativePath);
      if (await fileExists(filePath)) {
        stats.filesExist++;
      } else {
        stats.filesMissing++;
        issues.push({
          table: 'trips',
          id: trip.id,
          field: 'cover_image',
          url: trip.cover_image,
          issue: 'File does not exist'
        });
      }
    } else {
      stats.urlsInvalid++;
      issues.push({
        table: 'trips',
        id: trip.id,
        field: 'cover_image',
        url: trip.cover_image,
        issue: 'URL not migrated (still external)'
      });
    }
  }

  console.log(`  Checked ${trips.length} trips`);
}

/**
 * Verify trip_images table
 */
async function verifyTripImages(connection) {
  console.log('\n📸 Verifying trip images...');

  try {
    const [tripImages] = await connection.query('SELECT id, trip_id, image_url FROM trip_images WHERE image_url IS NOT NULL AND image_url != ""');

    for (const image of tripImages) {
      stats.totalChecks++;

      // Check if URL is in new format
      if (image.image_url.startsWith('/images/trips/')) {
        stats.urlsValid++;

        // Check if file exists
        const relativePath = image.image_url.replace('/images/', '');
        const filePath = path.join(CONFIG.IMAGE_DIR, relativePath);
        if (await fileExists(filePath)) {
          stats.filesExist++;
        } else {
          stats.filesMissing++;
          issues.push({
            table: 'trip_images',
            id: image.id,
            field: 'image_url',
            url: image.image_url,
            issue: 'File does not exist'
          });
        }
      } else {
        stats.urlsInvalid++;
        issues.push({
          table: 'trip_images',
          id: image.id,
          field: 'image_url',
          url: image.image_url,
          issue: 'URL not migrated (still external)'
        });
      }
    }

    console.log(`  Checked ${tripImages.length} trip images`);
  } catch (error) {
    console.log(`  ⚠ trip_images table doesn't exist, skipping`);
  }
}

/**
 * Verify place_photos table
 */
async function verifyPlacePhotos(connection) {
  console.log('\n📍 Verifying place photos...');

  const [photos] = await connection.query('SELECT id, place_id, url_small, url_medium, url_large, photo_order FROM place_photos');

  for (const photo of photos) {
    // Check small
    if (photo.url_small) {
      stats.totalChecks++;
      if (photo.url_small.startsWith('/images/places/')) {
        stats.urlsValid++;
        const relativePath = photo.url_small.replace('/images/', '');
        const filePath = path.join(CONFIG.IMAGE_DIR, relativePath);
        if (await fileExists(filePath)) {
          stats.filesExist++;
        } else {
          stats.filesMissing++;
          issues.push({
            table: 'place_photos',
            id: photo.id,
            field: 'url_small',
            url: photo.url_small,
            issue: 'File does not exist'
          });
        }
      } else {
        stats.urlsInvalid++;
        issues.push({
          table: 'place_photos',
          id: photo.id,
          field: 'url_small',
          url: photo.url_small,
          issue: 'URL not migrated (still external)'
        });
      }
    }

    // Check medium
    if (photo.url_medium) {
      stats.totalChecks++;
      if (photo.url_medium.startsWith('/images/places/')) {
        stats.urlsValid++;
        const relativePath = photo.url_medium.replace('/images/', '');
        const filePath = path.join(CONFIG.IMAGE_DIR, relativePath);
        if (await fileExists(filePath)) {
          stats.filesExist++;
        } else {
          stats.filesMissing++;
          issues.push({
            table: 'place_photos',
            id: photo.id,
            field: 'url_medium',
            url: photo.url_medium,
            issue: 'File does not exist'
          });
        }
      } else {
        stats.urlsInvalid++;
      }
    }

    // Check large
    if (photo.url_large) {
      stats.totalChecks++;
      if (photo.url_large.startsWith('/images/places/')) {
        stats.urlsValid++;
        const relativePath = photo.url_large.replace('/images/', '');
        const filePath = path.join(CONFIG.IMAGE_DIR, relativePath);
        if (await fileExists(filePath)) {
          stats.filesExist++;
        } else {
          stats.filesMissing++;
          issues.push({
            table: 'place_photos',
            id: photo.id,
            field: 'url_large',
            url: photo.url_large,
            issue: 'File does not exist'
          });
        }
      } else {
        stats.urlsInvalid++;
      }
    }
  }

  console.log(`  Checked ${photos.length} place photos (${photos.length * 3} total files)`);
}

/**
 * Verify city_photos table
 */
async function verifyCityPhotos(connection) {
  console.log('\n🏙️  Verifying city photos...');

  const [photos] = await connection.query('SELECT id, city_id, url_small, url_medium, url_large, photo_order FROM city_photos');

  for (const photo of photos) {
    // Check small
    if (photo.url_small) {
      stats.totalChecks++;
      if (photo.url_small.startsWith('/images/cities/')) {
        stats.urlsValid++;
        const relativePath = photo.url_small.replace('/images/', '');
        const filePath = path.join(CONFIG.IMAGE_DIR, relativePath);
        if (await fileExists(filePath)) {
          stats.filesExist++;
        } else {
          stats.filesMissing++;
          issues.push({
            table: 'city_photos',
            id: photo.id,
            field: 'url_small',
            url: photo.url_small,
            issue: 'File does not exist'
          });
        }
      } else {
        stats.urlsInvalid++;
        issues.push({
          table: 'city_photos',
          id: photo.id,
          field: 'url_small',
          url: photo.url_small,
          issue: 'URL not migrated (still external)'
        });
      }
    }

    // Check medium
    if (photo.url_medium) {
      stats.totalChecks++;
      if (photo.url_medium.startsWith('/images/cities/')) {
        stats.urlsValid++;
        const relativePath = photo.url_medium.replace('/images/', '');
        const filePath = path.join(CONFIG.IMAGE_DIR, relativePath);
        if (await fileExists(filePath)) {
          stats.filesExist++;
        } else {
          stats.filesMissing++;
          issues.push({
            table: 'city_photos',
            id: photo.id,
            field: 'url_medium',
            url: photo.url_medium,
            issue: 'File does not exist'
          });
        }
      } else {
        stats.urlsInvalid++;
      }
    }

    // Check large
    if (photo.url_large) {
      stats.totalChecks++;
      if (photo.url_large.startsWith('/images/cities/')) {
        stats.urlsValid++;
        const relativePath = photo.url_large.replace('/images/', '');
        const filePath = path.join(CONFIG.IMAGE_DIR, relativePath);
        if (await fileExists(filePath)) {
          stats.filesExist++;
        } else {
          stats.filesMissing++;
          issues.push({
            table: 'city_photos',
            id: photo.id,
            field: 'url_large',
            url: photo.url_large,
            issue: 'File does not exist'
          });
        }
      } else {
        stats.urlsInvalid++;
      }
    }
  }

  console.log(`  Checked ${photos.length} city photos (${photos.length * 3} total files)`);
}

/**
 * Save verification report
 */
async function saveReport() {
  console.log('\n📝 Saving verification report...');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(CONFIG.BACKUP_DIR, `verification-${timestamp}.txt`);

  const reportContent = `
=== IMAGE MIGRATION VERIFICATION REPORT ===
Timestamp: ${new Date().toISOString()}

STATISTICS:
Total Checks:   ${stats.totalChecks}
Files Exist:    ${stats.filesExist}
Files Missing:  ${stats.filesMissing}
URLs Valid:     ${stats.urlsValid}
URLs Invalid:   ${stats.urlsInvalid}

Success Rate:   ${((stats.filesExist / stats.totalChecks) * 100).toFixed(2)}%

ISSUES FOUND: ${issues.length}
${issues.length === 0 ? 'None - Migration appears successful!' : issues.map(i =>
  `- ${i.table}.${i.field} (ID: ${i.id}): ${i.issue}\n  URL: ${i.url}`
).join('\n')}
`;

  await fs.writeFile(reportPath, reportContent);
  console.log(`  ✓ Verification report saved to: ${reportPath}`);
}

/**
 * Main verification function
 */
async function main() {
  console.log('\n🔍 IMAGE MIGRATION VERIFICATION');
  console.log('================================\n');

  const connection = await getConnection();

  try {
    await verifyUsers(connection);
    await verifyTrips(connection);
    await verifyTripImages(connection);
    await verifyPlacePhotos(connection);
    await verifyCityPhotos(connection);

    await saveReport();

    console.log('\n✅ VERIFICATION COMPLETED!\n');
    console.log(`Total checks performed: ${stats.totalChecks}`);
    console.log(`Files found: ${stats.filesExist}`);
    console.log(`Files missing: ${stats.filesMissing}`);
    console.log(`URLs migrated: ${stats.urlsValid}`);
    console.log(`URLs not migrated: ${stats.urlsInvalid}`);

    if (issues.length > 0) {
      console.log(`\n⚠️  ${issues.length} issues found. Check the verification report for details.`);
      process.exit(1);
    } else {
      console.log('\n✅ No issues found - Migration successful!');
    }

  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    connection.release();
  }
}

// Run verification
main();
