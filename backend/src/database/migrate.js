const { getConnection } = require("./connection");

const migrations = [
  {
    name: "create_countries_table",
    up: `
      CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
    name: "create_cities_table",
    up: `
      CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        country_id INT NOT NULL,
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
        city_id INT,
        city VARCHAR(100) COMMENT 'Deprecated - use city_id instead',
        country VARCHAR(100) COMMENT 'Deprecated - use city_id->country instead',
        instagram_username VARCHAR(50),
        metrics_followers INT DEFAULT 0,
        metrics_following INT DEFAULT 0,
        metrics_trips INT DEFAULT 0,
        metrics_likes_received INT DEFAULT 0,
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
        likes_count INT DEFAULT 0,
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
        INDEX idx_likes_count (likes_count),
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        INDEX idx_trip_id (trip_id)
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

      // Add unique constraint after normalization
      await connection.query(
        "ALTER TABLE city_photos ADD CONSTRAINT city_photos_city_id_photo_order_unique UNIQUE (city_id, photo_order)"
      );

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

      // Add unique constraint after normalization
      await connection.query(
        "ALTER TABLE place_photos ADD CONSTRAINT place_photos_place_id_photo_order_unique UNIQUE (place_id, photo_order)"
      );
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
