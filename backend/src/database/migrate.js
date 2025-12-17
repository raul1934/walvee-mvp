const { getConnection } = require("./connection");

const migrations = [
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
        city VARCHAR(100),
        country VARCHAR(100),
        instagram_username VARCHAR(50),
        metrics_followers INT DEFAULT 0,
        metrics_following INT DEFAULT 0,
        metrics_trips INT DEFAULT 0,
        metrics_likes_received INT DEFAULT 0,
        onboarding_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_google_id (google_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: "create_trips_table",
    up: `
      CREATE TABLE IF NOT EXISTS trips (
        id CHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        destination VARCHAR(255) NOT NULL,
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
        INDEX idx_author_id (author_id),
        INDEX idx_destination (destination),
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
    name: "create_follows_table",
    up: `
      CREATE TABLE IF NOT EXISTS follows (
        id CHAR(36) PRIMARY KEY,
        follower_id CHAR(36) NOT NULL,
        followee_id CHAR(36) NOT NULL,
        followee_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (followee_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_follow (follower_id, followee_id),
        INDEX idx_follower_id (follower_id),
        INDEX idx_followee_id (followee_id)
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
    name: "create_trip_derivations_table",
    up: `
      CREATE TABLE IF NOT EXISTS trip_derivations (
        id CHAR(36) PRIMARY KEY,
        original_trip_id CHAR(36) NOT NULL,
        derived_trip_id CHAR(36),
        creator_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (original_trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (derived_trip_id) REFERENCES trips(id) ON DELETE SET NULL,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_original_trip_id (original_trip_id),
        INDEX idx_derived_trip_id (derived_trip_id),
        INDEX idx_creator_id (creator_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
];

const runMigrations = async () => {
  const connection = await getConnection();

  try {
    console.log("Running database migrations...\n");

    for (const migration of migrations) {
      console.log(`Running: ${migration.name}`);
      await connection.query(migration.up);
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
