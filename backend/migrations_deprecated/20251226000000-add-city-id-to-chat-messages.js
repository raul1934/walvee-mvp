/**
 * Migration: Add city_id column to chat_messages table
 *
 * This migration adds a UUID city_id column to link chat messages to specific cities,
 * replacing the previous string-based city_context field. The migration includes:
 * 1. Adding the city_id column with foreign key constraint
 * 2. Backfilling city_id from existing city_context values
 * 3. Adding performance index on (trip_id, city_id)
 *
 * The city_context column is kept for backward compatibility with old messages.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add city_id column (nullable initially for backfill)
    await queryInterface.addColumn('chat_messages', 'city_id', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    console.log('[Migration] Added city_id column to chat_messages');

    // Step 2: Backfill city_id from city_context
    // Matches city_context (city name string) to cities table by name (case-insensitive)
    // If multiple cities match, uses the first one (LIMIT 1)
    const [results] = await queryInterface.sequelize.query(`
      UPDATE chat_messages cm
      SET city_id = (
        SELECT c.id
        FROM cities c
        WHERE LOWER(c.name) = LOWER(cm.city_context)
        LIMIT 1
      )
      WHERE cm.city_context IS NOT NULL
      AND cm.city_context != '';
    `);

    console.log(`[Migration] Backfilled city_id for ${results} chat messages`);

    // Step 3: Add index for query performance
    // Common query pattern: filter messages by trip_id and city_id
    await queryInterface.addIndex('chat_messages', ['trip_id', 'city_id'], {
      name: 'idx_chat_messages_trip_city',
    });

    console.log('[Migration] Added index idx_chat_messages_trip_city');
    console.log('[Migration] Migration completed successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first
    await queryInterface.removeIndex('chat_messages', 'idx_chat_messages_trip_city');
    console.log('[Migration] Removed index idx_chat_messages_trip_city');

    // Remove column
    await queryInterface.removeColumn('chat_messages', 'city_id');
    console.log('[Migration] Removed city_id column from chat_messages');
    console.log('[Migration] Rollback completed successfully');
  },
};
