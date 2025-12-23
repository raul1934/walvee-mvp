const { sequelize } = require('../src/database/sequelize');

(async () => {
  try {
    const result = await sequelize.query(
      `SELECT TABLE_NAME, COLUMN_NAME, COLLATION_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
       AND (COLUMN_NAME LIKE '%_id' OR COLUMN_NAME = 'id')
       AND DATA_TYPE = 'char'
       AND COLLATION_NAME IS NOT NULL
       ORDER BY COLLATION_NAME, TABLE_NAME, COLUMN_NAME`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const byCollation = {};
    result.forEach(r => {
      const c = r.COLLATION_NAME;
      if (!byCollation[c]) byCollation[c] = [];
      byCollation[c].push(`${r.TABLE_NAME}.${r.COLUMN_NAME}`);
    });

    console.log(JSON.stringify(byCollation, null, 2));
  } catch (e) {
    console.error(e.message);
  } finally {
    process.exit();
  }
})();
