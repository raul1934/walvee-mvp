const { sequelize } = require('../src/database/sequelize');

// Common timezone to country mappings
const TIMEZONE_TO_COUNTRY = {
  'Europe/Madrid': 'ES',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Mexico_City': 'MX',
  'America/Sao_Paulo': 'BR',
  'America/Bogota': 'CO',
  'Europe/Paris': 'FR',
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL',
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN',
  'Asia/Seoul': 'KR',
  'Asia/Singapore': 'SG',
  'Asia/Dubai': 'AE',
  'Australia/Sydney': 'AU',
  'Pacific/Auckland': 'NZ',
};

(async () => {
  try {
    console.log('Re-associating cities with countries based on timezone...\n');

    // Get all cities without country_id
    const [cities] = await sequelize.query(`
      SELECT id, name, timezone
      FROM cities
      WHERE country_id IS NULL AND timezone IS NOT NULL
    `);

    console.log(`Found ${cities.length} cities without country associations\n`);

    let fixed = 0;
    let notFound = 0;

    for (const city of cities) {
      const countryCode = TIMEZONE_TO_COUNTRY[city.timezone];

      if (countryCode) {
        // Find the country by code
        const [countries] = await sequelize.query(`
          SELECT id FROM countries WHERE code = ?
        `, {
          replacements: [countryCode]
        });

        if (countries.length > 0) {
          await sequelize.query(`
            UPDATE cities SET country_id = ? WHERE id = ?
          `, {
            replacements: [countries[0].id, city.id]
          });
          console.log(`✓ ${city.name} -> ${countryCode}`);
          fixed++;
        } else {
          console.log(`⚠ ${city.name}: Country ${countryCode} not found in database`);
          notFound++;
        }
      }
    }

    console.log(`\n✅ Re-associated ${fixed} cities with countries`);
    if (notFound > 0) {
      console.log(`⚠️  ${notFound} cities could not be associated (country not in DB)`);
    }

    const [remaining] = await sequelize.query(`
      SELECT COUNT(*) as count FROM cities WHERE country_id IS NULL
    `);
    console.log(`\nRemaining cities without country: ${remaining[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
