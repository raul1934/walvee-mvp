"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create table with raw SQL to ensure exact charset/collation match
    await queryInterface.sequelize.query(`
      CREATE TABLE chat_messages (
        id CHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
        trip_id CHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
        role ENUM('user', 'assistant') NOT NULL,
        content TEXT COLLATE utf8mb4_unicode_ci NOT NULL,
        recommendations JSON DEFAULT NULL COMMENT 'Array of recommendation objects for assistant messages',
        city_context VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'City name for filtering messages by city tab (null = Main Chat)',
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Client-provided ordering timestamp',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_chat_messages_trip_timestamp (trip_id, timestamp),
        KEY idx_chat_messages_trip_city (trip_id, city_context),
        CONSTRAINT chat_messages_ibfk_1 FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("chat_messages");
  },
};
