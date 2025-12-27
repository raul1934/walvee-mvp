const { getConnection } = require("../src/database/connection");

function parseArgs() {
  const args = {};
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    if (a.startsWith("--")) {
      const key = a.replace(/^--/, "");
      const next = raw[i + 1];
      if (next && !next.startsWith("-")) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else if (a.startsWith("-")) {
      const key = a.replace(/^-+/, "");
      const next = raw[i + 1];
      if (next && !next.startsWith("-")) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

const argv = parseArgs();

// Support positional args: `node scripts/add-trip-photos.js 10 5` or via npm: `npm run add-trip-photos -- 10 5`
const positional = process.argv.slice(2).filter((a) => !a.startsWith("-"));
if (!argv.limit && positional[0]) argv.limit = positional[0];
if (!argv.per && positional[1]) argv.per = positional[1];

const LIMIT = parseInt(argv.limit || argv.l || 10, 10);
const PER_TRIP = parseInt(argv.per || argv.p || 3, 10);
const DRY_RUN = !!argv["dry-run"] || !!argv.dry;

async function main() {
  console.log(
    `\n📸 Adding photos to up to ${LIMIT} trips (max ${PER_TRIP} images/trip) ${
      DRY_RUN ? "[DRY RUN]" : ""
    }`
  );
  const connection = await getConnection();
  try {
    // Support --all to process all trips (no LIMIT)
    let tripsQuery = "SELECT id FROM trips ORDER BY created_at DESC";
    const tripsParams = [];
    if (!(argv.all || argv.a)) {
      tripsQuery += " LIMIT ?";
      tripsParams.push(LIMIT);
    }

    const [trips] = await connection.query(tripsQuery, tripsParams);

    let totalInserted = 0;
    for (const trip of trips) {
      // Count existing images and get current max order and cover presence
      const [existingCountRes] = await connection.query(
        "SELECT COUNT(*) as cnt FROM trip_images WHERE trip_id = ?",
        [trip.id]
      );
      const existingCount = existingCountRes[0].cnt || 0;

      if (existingCount >= PER_TRIP) {
        console.log(
          `  ⏭ Trip ${trip.id} already has ${existingCount} images (>= ${PER_TRIP}), skipping`
        );
        continue;
      }

      const [maxOrderRes] = await connection.query(
        "SELECT COALESCE(MAX(image_order), -1) as max_order FROM trip_images WHERE trip_id = ?",
        [trip.id]
      );
      let order = (maxOrderRes[0].max_order || -1) + 1;

      const toInsert = PER_TRIP - existingCount;
      const imagesToInsert = [];

      // First, try to get random place photos associated with this trip
      if (toInsert > 0) {
        const [placePhotos] = await connection.query(
          `SELECT p.id FROM place_photos p
           JOIN trip_places tp ON tp.place_id = p.place_id
           WHERE tp.trip_id = ?
           ORDER BY RAND() LIMIT ?`,
          [trip.id, toInsert]
        );
        for (const p of placePhotos)
          imagesToInsert.push({ place_photo_id: p.id });
      }

      // If still need more, get random city photos
      if (imagesToInsert.length < toInsert) {
        const need = toInsert - imagesToInsert.length;
        const [cityPhotos] = await connection.query(
          `SELECT cp.id FROM city_photos cp
           JOIN trip_cities tc ON tc.city_id = cp.city_id
           WHERE tc.trip_id = ?
           ORDER BY RAND() LIMIT ?`,
          [trip.id, need]
        );
        for (const cp of cityPhotos)
          imagesToInsert.push({ city_photo_id: cp.id });
      }

      if (imagesToInsert.length === 0) {
        console.log(
          `  ⚠ No place or city photos found for trip ${trip.id}, skipping`
        );
        continue;
      }

      // Insert gathered images up to `toInsert`
      for (const img of imagesToInsert.slice(0, toInsert)) {
        const params = [
          trip.id,
          img.place_photo_id || null,
          img.city_photo_id || null,
          order,
        ];
        const sql = `INSERT INTO trip_images (id, trip_id, place_photo_id, city_photo_id, image_order, created_at) VALUES (UUID(), ?, ?, ?, ?, NOW())`;
        if (DRY_RUN) {
          console.log(
            `    ↳ [DRY] Would insert: trip=${trip.id}, place_photo_id=${
              img.place_photo_id || ""
            }, city_photo_id=${
              img.city_photo_id || ""
            }, order=${order}`
          );
        } else {
          await connection.query(sql, params);
          console.log(
            `    ✓ Inserted image for trip ${trip.id} (order ${order})`
          );
          totalInserted++;
        }
        order++;
      }
    }

    console.log(
      `\n✅ Done. ${
        DRY_RUN
          ? "No changes made (dry run)."
          : `Inserted ${totalInserted} images.`
      }`
    );
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.stack || err.message);
    process.exit(1);
  } finally {
    try {
      await connection.release();
    } catch (e) {
      /* ignore */
    }
  }
}

main();
