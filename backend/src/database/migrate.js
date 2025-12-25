const { getConnection } = require("./connection");

const migrations = [
  {
    name: "create_countries_table",
    up: `
      CREATE TABLE IF NOT EXISTS countries (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        code VARCHAR(2) NOT NULL UNIQUE COMMENT 'ISO 3166-1 alpha-2 country code',
        google_maps_id VARCHAR(255) UNIQUE COMMENT 'Google Maps Place ID for the country',
        continent VARCHAR(50),
        flag_emoji VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_name (name),
        INDEX idx_google_maps_id (google_maps_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "add_display_order_to_trip_places",
    up: async (connection) => {
      console.log("  -> Adding display_order column to trip_places if missing");

      try {
        await connection.query(
          "ALTER TABLE trip_places ADD COLUMN display_order INT DEFAULT 0"
        );
        await connection.query(
          "ALTER TABLE trip_places ADD INDEX idx_trip_place_display_order (display_order)"
        );
        console.log("    ✓ display_order column added to trip_places");
      } catch (err) {
        if (err && err.code === "ER_DUP_FIELDNAME") {
          console.log(
            "    -> display_order already exists on trip_places, skipping"
          );
        } else {
          throw err;
        }
      }

      // Backfill display_order values per trip using created_at order
      try {
        console.log(
          "    -> Backfilling display_order for existing trip_places"
        );
        await connection.query(`
          SET @curr_trip = NULL;
          SET @rn = -1;
          UPDATE trip_places tp
          JOIN (
            SELECT id, trip_id, (@rn := IF(@curr_trip = trip_id, @rn + 1, 0)) AS rn, (@curr_trip := trip_id) as _t
            FROM (SELECT id, trip_id FROM trip_places ORDER BY trip_id, created_at, id) s
          ) ranks ON tp.id = ranks.id
          SET tp.display_order = ranks.rn;
        `);
        console.log("    ✓ Backfilled display_order for trip_places");
      } catch (err) {
        console.log(
          "    -> Could not backfill trip_places.display_order (this may be OK)"
        );
      }
    },
  },
  {
    name: "create_cities_table",
    up: `
      CREATE TABLE IF NOT EXISTS cities (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        country_id CHAR(36) NOT NULL,
        google_maps_id VARCHAR(255) UNIQUE COMMENT 'Google Maps Place ID for the city',
        state VARCHAR(100) COMMENT 'State/Province/Region',
        latitude DOUBLE,
        longitude DOUBLE,
        timezone VARCHAR(50),
        population INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
        INDEX idx_country_id (country_id),
        INDEX idx_name (name),
        INDEX idx_google_maps_id (google_maps_id),
        UNIQUE KEY unique_city_country (name, country_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "create_users_table",
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        google_id VARCHAR(255) UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        preferred_name VARCHAR(100),
        photo_url TEXT,
        bio TEXT,
        city_id CHAR(36),
        city VARCHAR(100) COMMENT 'Deprecated - use city_id instead',
        country VARCHAR(100) COMMENT 'Deprecated - use city_id->country instead',
        instagram_username VARCHAR(50),
        onboarding_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
        INDEX idx_email (email),
        INDEX idx_google_id (google_id),
        INDEX idx_city_id (city_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "create_trips_table",
    up: `
      CREATE TABLE IF NOT EXISTS trips (
        id CHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        destination VARCHAR(255) NOT NULL COMMENT 'Deprecated - use destination_city_id instead',
        destination_city_id INT,
        description TEXT,
        duration VARCHAR(50),
        budget VARCHAR(50),
        transportation VARCHAR(255),
        accommodation VARCHAR(255),
        best_time_to_visit VARCHAR(255),
        difficulty_level VARCHAR(50),
        trip_type VARCHAR(50),
        cover_image TEXT,
        author_id CHAR(36) NOT NULL,
        destination_lat DOUBLE,
        destination_lng DOUBLE,
        is_public BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        views_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (destination_city_id) REFERENCES cities(id) ON DELETE SET NULL,
        INDEX idx_author_id (author_id),
        INDEX idx_destination (destination),
        INDEX idx_destination_city_id (destination_city_id),
        INDEX idx_is_public (is_public),
        INDEX idx_is_featured (is_featured),
        INDEX idx_created_at (created_at),
        
        FULLTEXT idx_search (title, destination, description)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "create_trip_images_table",
    up: `
      CREATE TABLE IF NOT EXISTS trip_images (
        id CHAR(36) PRIMARY KEY,
        trip_id CHAR(36) NOT NULL,
        image_url TEXT NOT NULL,
        caption TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        INDEX idx_trip_id (trip_id),
        INDEX idx_display_order (display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "create_trip_tags_table",
    up: `
      CREATE TABLE IF NOT EXISTS trip_tags (
        id CHAR(36) PRIMARY KEY,
        trip_id CHAR(36) NOT NULL,
        tag VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        INDEX idx_trip_id (trip_id),
        INDEX idx_tag (tag)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "create_trip_places_table",
    up: `
      CREATE TABLE IF NOT EXISTS trip_places (
        id CHAR(36) PRIMARY KEY,
        trip_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        rating DECIMAL(2,1),
        price_level INT,
        types JSON,
        description TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        INDEX idx_trip_id (trip_id),
        INDEX idx_trip_place_display_order (display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "create_trip_itinerary_days_table",
    up: `
      CREATE TABLE IF NOT EXISTS trip_itinerary_days (
        id CHAR(36) PRIMARY KEY,
        trip_id CHAR(36) NOT NULL,
        day_number INT NOT NULL,
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        INDEX idx_trip_id (trip_id),
        INDEX idx_day_number (day_number),
        UNIQUE KEY unique_trip_day (trip_id, day_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "create_trip_itinerary_activities_table",
    up: `
      CREATE TABLE IF NOT EXISTS trip_itinerary_activities (
        id CHAR(36) PRIMARY KEY,
        itinerary_day_id CHAR(36) NOT NULL,
        time VARCHAR(20),
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        description TEXT,
        activity_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (itinerary_day_id) REFERENCES trip_itinerary_days(id) ON DELETE CASCADE,
        INDEX idx_itinerary_day_id (itinerary_day_id),
        INDEX idx_activity_order (activity_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "create_trip_likes_table",
    up: `
      CREATE TABLE IF NOT EXISTS trip_likes (
        id CHAR(36) PRIMARY KEY,
        trip_id CHAR(36) NOT NULL,
        liker_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (liker_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_like (trip_id, liker_id),
        INDEX idx_trip_id (trip_id),
        INDEX idx_liker_id (liker_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "add_unique_constraint_trip_likes",
    up: async (connection) => {
      console.log(
        "  -> Deduplicating trip_likes and adding unique constraint (trip_id, liker_id)"
      );

      // Remove duplicates keeping the earliest id
      await connection.query(`
          DELETE t1 FROM trip_likes t1
          INNER JOIN trip_likes t2
            ON t1.trip_id = t2.trip_id
            AND t1.liker_id = t2.liker_id
            AND t1.id > t2.id
        `);

      try {
        await connection.query(
          "ALTER TABLE trip_likes ADD CONSTRAINT trip_likes_trip_id_liker_id_unique UNIQUE (trip_id, liker_id)"
        );
      } catch (err) {
        if (err && err.code === "ER_DUP_KEYNAME") {
          console.log(
            "  -> Unique constraint trip_likes_trip_id_liker_id_unique already exists, skipping"
          );
        } else {
          throw err;
        }
      }

      // Recalculate likes_count on trips to ensure consistency (skip if column removed)
      try {
        await connection.query(`
          UPDATE trips
          SET likes_count = (
            SELECT COUNT(*) FROM trip_likes WHERE trip_likes.trip_id = trips.id
          )
        `);
      } catch (err) {
        if (err && err.code === "ER_BAD_FIELD_ERROR") {
          console.log(
            "  -> trips.likes_count column not present, skipping likes_count recalculation"
          );
        } else {
          throw err;
        }
      }
    },
  },
  {
    name: "create_reviews_table",
    up: `
      CREATE TABLE IF NOT EXISTS reviews (
        id CHAR(36) PRIMARY KEY,
        trip_id CHAR(36),
        place_id VARCHAR(255),
        reviewer_id CHAR(36) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_trip_id (trip_id),
        INDEX idx_place_id (place_id),
        INDEX idx_reviewer_id (reviewer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "create_trip_steals_table",
    up: `
      CREATE TABLE IF NOT EXISTS trip_steals (
        id CHAR(36) PRIMARY KEY,
        original_trip_id CHAR(36) NOT NULL,
        new_trip_id CHAR(36) NOT NULL,
        original_user_id CHAR(36) NOT NULL,
        new_user_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (original_trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (new_trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (original_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (new_user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_original_trip_id (original_trip_id),
        INDEX idx_new_trip_id (new_trip_id),
        INDEX idx_original_user_id (original_user_id),
        INDEX idx_new_user_id (new_user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "create_place_favorites_table",
    up: `
      CREATE TABLE IF NOT EXISTS place_favorites (
        id CHAR(36) PRIMARY KEY,
        place_id INT NOT NULL,
        user_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_place_favorite (place_id, user_id),
        INDEX idx_place_id (place_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "create_trip_cities_table",
    up: async (connection) => {
      // Create table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS trip_cities (
          id CHAR(36) PRIMARY KEY,
          trip_id CHAR(36) NOT NULL,
          city_id INT NOT NULL,
          city_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
          FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
          INDEX idx_trip_id (trip_id),
          INDEX idx_city_id (city_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Check if destination_city_id column exists before backfilling
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'trips'
          AND COLUMN_NAME = 'destination_city_id'
      `);

      if (columns && columns.length > 0) {
        // Backfill existing destination_city_id values into trip_cities
        await connection.query(`
          INSERT INTO trip_cities (id, trip_id, city_id, city_order)
          SELECT UUID(), t.id AS trip_id, t.destination_city_id AS city_id, 0
          FROM trips t
          WHERE t.destination_city_id IS NOT NULL
            AND NOT EXISTS (
              SELECT 1 FROM trip_cities tc WHERE tc.trip_id = t.id AND tc.city_id = t.destination_city_id
            )
        `);
        console.log("  -> Backfilled trip_cities from destination_city_id");
      } else {
        console.log("  -> Skipping backfill (destination_city_id column doesn't exist)");
      }
    },
  },
  {
    name: "add_trip_cities_unique_constraint",
    up: async (connection) => {
      try {
        await connection.query(
          "ALTER TABLE trip_cities ADD CONSTRAINT trip_cities_trip_id_city_id_unique UNIQUE (trip_id, city_id)"
        );
      } catch (err) {
        if (err && err.code === "ER_DUP_KEYNAME") {
          console.log(
            "  -> Unique constraint trip_cities_trip_id_city_id_unique already exists, skipping"
          );
        } else {
          throw err;
        }
      }
    },
  },
  {
    name: "backfill_trip_cities_city_order_from_places",
    up: async (connection) => {
      console.log(
        "  -> Backfilling trip_cities.city_order from trip_places display_order where possible"
      );
      try {
        await connection.query(`
          UPDATE trip_cities tc
          JOIN (
            SELECT tp.trip_id, p.city_id, MIN(tp.display_order) AS min_order
            FROM trip_places tp
            JOIN places p ON tp.place_id = p.id
            GROUP BY tp.trip_id, p.city_id
          ) sub ON tc.trip_id = sub.trip_id AND tc.city_id = sub.city_id
          SET tc.city_order = sub.min_order;
        `);
        console.log("    ✓ Backfilled trip_cities.city_order");
      } catch (err) {
        console.log(
          "    -> Could not backfill trip_cities.city_order (this may be OK)"
        );
      }
    },
  },
  {
    name: "add_index_trip_cities_city_order",
    up: async (connection) => {
      try {
        await connection.query(
          "ALTER TABLE trip_cities ADD INDEX idx_trip_cities_city_order (city_order)"
        );
        console.log("    ✓ Added index idx_trip_cities_city_order");
      } catch (err) {
        if (err && err.code === "ER_DUP_KEYNAME") {
          console.log(
            "    -> Index idx_trip_cities_city_order already exists, skipping"
          );
        } else {
          throw err;
        }
      }
    },
  },
  {
    name: "drop_trips_likes_count_column",
    up: async (connection) => {
      console.log(
        "  -> Dropping trips.likes_count column (use trip_likes counts instead)"
      );

      try {
        await connection.query("ALTER TABLE trips DROP INDEX idx_likes_count");
      } catch (err) {
        // ignore if index doesn't exist
      }

      try {
        await connection.query("ALTER TABLE trips DROP COLUMN likes_count");
      } catch (err) {
        if (err && err.code === "ER_CANT_DROP_FIELD_OR_KEY") {
          console.log(
            "  -> Could not drop column likes_count (maybe already removed), skipping"
          );
        } else {
          throw err;
        }
      }
    },
  },
  {
    name: "add_unique_photo_order",
    up: async (connection) => {
      // Fix duplicate photo_order values per city by reassigning sequential orders
      console.log(
        "  -> Normalizing city_photos.photo_order per city to remove duplicates"
      );
      const [cities] = await connection.query(
        "SELECT DISTINCT city_id FROM city_photos WHERE city_id IS NOT NULL"
      );

      for (const c of cities) {
        const cityId = c.city_id;
        const [photos] = await connection.query(
          "SELECT id FROM city_photos WHERE city_id = ? ORDER BY photo_order ASC, id ASC",
          [cityId]
        );
        for (let i = 0; i < photos.length; i++) {
          await connection.query(
            "UPDATE city_photos SET photo_order = ? WHERE id = ?",
            [i, photos[i].id]
          );
        }
      }

      // Add unique constraint after normalization (ignore if already exists)
      try {
        await connection.query(
          "ALTER TABLE city_photos ADD CONSTRAINT city_photos_city_id_photo_order_unique UNIQUE (city_id, photo_order)"
        );
      } catch (err) {
        if (err && err.code === "ER_DUP_KEYNAME") {
          console.log(
            "  -> Unique constraint city_photos_city_id_photo_order_unique already exists, skipping"
          );
        } else {
          throw err;
        }
      }

      // Fix duplicate photo_order values per place by reassigning sequential orders
      console.log(
        "  -> Normalizing place_photos.photo_order per place to remove duplicates"
      );
      const [places] = await connection.query(
        "SELECT DISTINCT place_id FROM place_photos WHERE place_id IS NOT NULL"
      );

      for (const p of places) {
        const placeId = p.place_id;
        const [photos] = await connection.query(
          "SELECT id FROM place_photos WHERE place_id = ? ORDER BY photo_order ASC, id ASC",
          [placeId]
        );
        for (let i = 0; i < photos.length; i++) {
          await connection.query(
            "UPDATE place_photos SET photo_order = ? WHERE id = ?",
            [i, photos[i].id]
          );
        }
      }

      // Add unique constraint after normalization (ignore if already exists)
      try {
        await connection.query(
          "ALTER TABLE place_photos ADD CONSTRAINT place_photos_place_id_photo_order_unique UNIQUE (place_id, photo_order)"
        );
      } catch (err) {
        if (err && err.code === "ER_DUP_KEYNAME") {
          console.log(
            "  -> Unique constraint place_photos_place_id_photo_order_unique already exists, skipping"
          );
        } else {
          throw err;
        }
      }
    },
  },
  // Migration to ensure `trip_places.place_id` can store UUIDs and reference `places(id)`
  {
    name: "migrate_trip_places_place_id_to_uuid",
    up: async (connection) => {
      try {
        const [rows] = await connection.query(`
          SELECT COLUMN_NAME, COLUMN_TYPE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'trip_places'
            AND COLUMN_NAME = 'place_id'
        `);

        if (rows && rows.length > 0 && rows[0].COLUMN_TYPE && rows[0].COLUMN_TYPE.toLowerCase().includes('int')) {
          await connection.query(`ALTER TABLE trip_places MODIFY COLUMN place_id CHAR(36) NULL`);
          console.log('  -> Changed trip_places.place_id to CHAR(36)');
        } else {
          console.log('  -> trip_places.place_id already non-integer or missing, skipping');
        }

        // Drop existing FK if present and add proper FK to places.id
        try {
          await connection.query(`ALTER TABLE trip_places DROP FOREIGN KEY fk_trip_places_place`);
        } catch (err) {
          // ignore
        }

        try {
          await connection.query(`ALTER TABLE trip_places ADD CONSTRAINT fk_trip_places_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL ON UPDATE CASCADE`);
          console.log('  -> Added fk_trip_places_place -> places(id)');
        } catch (err) {
          console.log('  -> Could not add fk_trip_places_place (maybe exists)');
        }
      } catch (err) {
        console.error('Error migrating trip_places.place_id:', err.message);
        throw err;
      }
    },
  },
];

const runMigrations = async () => {
  const connection = await getConnection();

  try {
    console.log("Running database migrations...\n");

    for (const migration of migrations) {
      console.log(`Running: ${migration.name}`);
      // migration.up can be a function (async) or a SQL string (possibly multiple statements).
      if (typeof migration.up === "function") {
        await migration.up(connection);
      } else {
        // Execute each non-empty SQL statement individually to avoid errors when multipleStatements is disabled.
        const statements = migration.up
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const stmt of statements) {
          await connection.query(stmt);
        }
      }
      console.log(`✓ ${migration.name} completed\n`);
    }

    console.log("All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    connection.release();
  }
};

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigrations };
