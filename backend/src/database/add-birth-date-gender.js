const { getConnection } = require("./connection");

/**
 * Migration to add birth_date and gender columns to users table
 * Also removes age_in_years and gender_other if they exist
 */
const addBirthDateAndGender = async () => {
  const connection = await getConnection();

  try {
    console.log("Adding birth_date and gender columns to users table...\n");

    // Check if birth_date column exists
    const [birthDateColumn] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'birth_date'"
    );

    if (birthDateColumn.length === 0) {
      console.log("Adding birth_date column to users table...");
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN birth_date DATE NULL COMMENT 'User\\'s date of birth (YYYY-MM-DD)'
        AFTER city_id
      `);
      console.log("✓ Added birth_date column to users table\n");
    } else {
      console.log("✓ birth_date column already exists in users table\n");
    }

    // Check if gender column exists
    const [genderColumn] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'gender'"
    );

    if (genderColumn.length === 0) {
      console.log("Adding gender column to users table...");
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN gender ENUM('male', 'female', 'non-binary', 'other', 'prefer-not-to-say') NULL
        AFTER birth_date
      `);
      console.log("✓ Added gender column to users table\n");
    } else {
      console.log("✓ gender column already exists in users table\n");
    }

    // Remove deprecated age_in_years column if it exists
    const [ageColumn] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'age_in_years'"
    );

    if (ageColumn.length > 0) {
      console.log("Removing deprecated age_in_years column...");
      await connection.query(`
        ALTER TABLE users
        DROP COLUMN age_in_years
      `);
      console.log("✓ Removed age_in_years column\n");
    } else {
      console.log("✓ age_in_years column already removed\n");
    }

    // Remove deprecated gender_other column if it exists
    const [genderOtherColumn] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'gender_other'"
    );

    if (genderOtherColumn.length > 0) {
      console.log("Removing deprecated gender_other column...");
      await connection.query(`
        ALTER TABLE users
        DROP COLUMN gender_other
      `);
      console.log("✓ Removed gender_other column\n");
    } else {
      console.log("✓ gender_other column already removed\n");
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    connection.release();
  }
};

if (require.main === module) {
  addBirthDateAndGender()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { addBirthDateAndGender };
