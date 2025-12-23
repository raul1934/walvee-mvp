module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Standardize all tables to utf8mb4_unicode_ci collation
    // This fixes the "Illegal mix of collations" error when joining tables

    const tablesToFix = [
      'countries',
      'cities',
      'places',
      'city_photos',
      'place_photos',
    ];

    for (const table of tablesToFix) {
      try {
        await queryInterface.sequelize.query(
          `ALTER TABLE ${table} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
        console.log(`✓ Converted ${table} to utf8mb4_unicode_ci`);
      } catch (err) {
        console.error(`Error converting ${table}: ${err.message}`);
        throw err;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert tables back to utf8mb4_0900_ai_ci
    const tablesToRevert = [
      'countries',
      'cities',
      'places',
      'city_photos',
      'place_photos',
    ];

    for (const table of tablesToRevert) {
      try {
        await queryInterface.sequelize.query(
          `ALTER TABLE ${table} CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`
        );
      } catch (err) {
        console.error(`Error reverting ${table}: ${err.message}`);
      }
    }
  },
};
