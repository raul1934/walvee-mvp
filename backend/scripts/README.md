# Image Migration Scripts

This directory contains scripts to migrate all images from the database to a new local directory structure.

## Overview

The migration process:
1. Downloads all images from external URLs (Google Maps, etc.) and local uploads
2. Organizes them in a clean directory structure under `backend/images/`
3. Updates all database URLs to point to the new locations
4. Creates backups and detailed logs

## Files

- **`migrate-images.js`** - Main migration script
- **`verify-migration.js`** - Post-migration verification script
- **`README.md`** - This file

## Prerequisites

1. Ensure database is running and accessible
2. Ensure you have write permissions to create directories
3. Ensure you have internet access to download external images

## Usage

### Step 1: Dry Run (Test Mode)

Test the migration without making database changes:

```bash
cd backend
node scripts/migrate-images.js --dry-run
```

This will:
- Download all images to the new directory structure
- Create backups
- Show you what would be updated in the database
- Generate logs and reports
- **NOT update the database**

### Step 2: Run Migration

Once you've verified the dry run looks good:

```bash
node scripts/migrate-images.js
```

This will:
- Download all images
- Update all database URLs
- Create backups before making changes
- Generate detailed logs

### Step 3: Verify Migration

After migration completes, verify everything:

```bash
node scripts/verify-migration.js
```

This will:
- Check all database URLs are updated correctly
- Verify all files exist on disk
- Generate a verification report
- Exit with error code if issues are found

## Configuration

Environment variables you can set:

```bash
# Directory for new images (default: backend/images)
export NEW_IMAGE_DIR=/path/to/images

# Directory for backups and logs (default: backend/backups)
export BACKUP_DIR=/path/to/backups

# Number of parallel downloads (default: 5)
export MAX_CONCURRENT_DOWNLOADS=10

# Number of retry attempts for failed downloads (default: 3)
export RETRY_ATTEMPTS=5

# Base URL for local uploads (default: http://localhost:3000)
export BASE_URL=https://yourdomain.com
```

## New Directory Structure

After migration, images will be organized as:

```
backend/images/
├── users/
│   ├── {user_id}.jpg
│   ├── {user_id}.png
│   └── ...
├── trips/
│   ├── {trip_id}/
│   │   ├── cover.jpg
│   │   ├── 0.jpg  (from trip_images)
│   │   ├── 1.jpg
│   │   └── ...
│   └── ...
├── places/
│   ├── {place_id}/
│   │   ├── 0_small.jpg
│   │   ├── 0_medium.jpg
│   │   ├── 0_large.jpg
│   │   └── ...
│   └── ...
└── cities/
    ├── {city_id}/
    │   ├── 0_small.jpg
    │   ├── 0_medium.jpg
    │   ├── 0_large.jpg
    │   └── ...
    └── ...
```

## Database Tables Affected

The migration processes these tables:

1. **`users`** - `photo_url` field
2. **`trips`** - `cover_image` field
3. **`trip_images`** - `image_url` field (if table exists)
4. **`place_photos`** - `url_small`, `url_medium`, `url_large` fields
5. **`city_photos`** - `url_small`, `url_medium`, `url_large` fields

## Output Files

All generated in `backend/backups/`:

1. **`backup-{timestamp}.json`** - Complete database backup before migration
2. **`url-mapping-{timestamp}.json`** - Mapping of old URLs to new paths
3. **`migration-{timestamp}.log`** - Detailed migration log with statistics
4. **`verification-{timestamp}.txt`** - Verification report (from verify script)

## What Gets Migrated

✅ **Migrated:**
- User profile photos (Google OAuth, uploaded)
- Trip cover images (uploaded, external)
- Trip images from trip_images table
- Place photos from Google Maps (all 3 sizes)
- City photos from Google Maps (all 3 sizes)

❌ **Skipped:**
- Unsplash URLs (these are dynamic/generic fallbacks)
- Null/empty URLs
- Invalid URLs

## Error Handling

The script handles errors gracefully:

- **Failed downloads**: Retried 3 times with exponential backoff
- **404 errors**: Logged and skipped
- **Database errors**: Transaction rolled back, no changes made
- **Network issues**: Retried automatically

## Rollback

If migration fails or you need to rollback:

1. Stop the application
2. Find the backup file: `backend/backups/backup-{timestamp}.json`
3. Run a rollback script (you'll need to create this based on the backup)
4. Delete the `backend/images/` directory
5. Restart the application

## Post-Migration Steps

After successful migration:

1. ✅ Update server.js to serve static files from `/images/`:
   ```javascript
   app.use('/images', express.static(path.join(__dirname, 'images')));
   ```

2. ✅ Update `.gitignore` to exclude images if needed:
   ```
   images/
   ```

3. ✅ Update deployment scripts to include images directory

4. ✅ Test the application thoroughly

## Troubleshooting

### Script fails with "connect ECONNREFUSED"
- Ensure MySQL database is running
- Check database credentials in .env file

### Downloads fail with 404 errors
- Some external URLs may be dead/expired
- Check the migration log for failed URLs
- These will be skipped and logged

### Script runs out of memory
- Reduce `MAX_CONCURRENT_DOWNLOADS` to 3 or less
- Run migration in batches (modify script if needed)

### Database transaction fails
- Check database user has UPDATE permissions
- Ensure no other process is locking the tables
- Review error message in console

## Support

If you encounter issues:

1. Check the migration log: `backend/backups/migration-{timestamp}.log`
2. Run verification: `node scripts/verify-migration.js`
3. Review failed downloads in the log
4. Contact support with the log files

## License

Part of the Walvee backend codebase.
