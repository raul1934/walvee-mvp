const { sequelize } = require('../src/database/sequelize');

(async () => {
  try {
    console.log('Fixing orphaned city country references...\n');

    // Set country_id to NULL for cities that reference non-existent countries
    const [result] = await sequelize.query(`
      UPDATE cities
      SET country_id = NULL
      WHERE country_id IS NOT NULL
      AND country_id NOT IN (SELECT id FROM countries)
    `);

    console.log(`✓ Fixed ${result.affectedRows} cities with orphaned country references`);
    console.log('These cities now have country_id = NULL and will need to be re-associated with countries.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
