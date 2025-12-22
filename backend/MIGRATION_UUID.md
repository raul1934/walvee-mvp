# UUID Migration Guide ✅

This repository is being migrated so that all primary keys (IDs) use UUIDs (CHAR(36)) and timestamp columns are present.

Important notes

- This is a destructive migration **— BACKUP YOUR DATABASE** before running.
- Run migrations in a maintenance window since many schema changes (dropping PKs, renaming columns) will occur.

What was added

- New Sequelize migration: `src/database/migrations/20251223010000-convert-cities-places-to-uuid.js`
  - Adds UUID columns to `countries`, `cities`, `places`, `place_photos`, `city_photos`.
  - Backfills UUIDs for existing rows and replaces integer PKs/FKs with CHAR(36).
  - Adds FK constraints referencing new UUID columns.

What else was changed

- Sequelize models updated to use `DataTypes.UUID` for primary keys and relevant foreign keys:
  - `src/models/sequelize/Country.js`
  - `src/models/sequelize/City.js`
  - `src/models/sequelize/Place.js`
  - `src/models/sequelize/PlacePhoto.js`
  - `src/models/sequelize/CityPhoto.js`
- Migration scripts updated to create tables with `CHAR(36)` IDs where appropriate:
  - `src/database/migrate.js`
  - `src/database/add-places-tables.js`
  - `src/database/add-city-photos-table.js`
  - `src/database/add-user-follow-id.js` (now backfills `id` with UUIDs)
- Route validators updated to expect UUIDs:
  - `src/routes/users.js` (city_id)
  - `src/routes/placeFavorites.js` (place_id)
  - `src/routes/trips.js` (cities validator now accepts UUID strings)
- Scripts that insert rows which previously relied on `insertId` were updated to generate UUIDs explicitly (e.g. `scripts/link-places-to-cities.js`).

How to run

1. Backup your database.
2. Run your DB migrations (Sequelize or the included scripts). Example with Sequelize CLI:
   - npm run migrate (or your project's migration command — ensure `NODE_ENV` and DB config point to staging/production DB)
3. Run the UUID conversion migration (Sequelize migration):

- npx sequelize-cli db:migrate --migrations-path src/database/migrations
- Or run the migration file directly via Sequelize if you prefer; ensure you have a DB backup.

3. Run any idempotent migration scripts: `node src/database/add-places-tables.js`, `node src/database/add-city-photos-table.js`, etc.

Rollbacks

- The primary conversion migration's `down` is intentionally a no-op (reversing PK type changes can be destructive). To revert, restore from your DB backup.

Next steps

- Review and convert other tables that still use integer IDs (if any).
- Run the migration on a staging environment and run full integration tests.

If you'd like, I can:

- Add additional migrations to convert other tables to UUIDs
- Run a dry-run migration on a sample DB and report findings

---
