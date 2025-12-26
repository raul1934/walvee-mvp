module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const [cols] = await queryInterface.sequelize.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'trip_cities'
          AND COLUMN_NAME = 'id'
      `);

      if (!cols || cols.length === 0) {
        // Add id column as CHAR(36) with default UUID()
        await queryInterface.sequelize.query(
          `ALTER TABLE trip_cities ADD COLUMN id CHAR(36) NOT NULL DEFAULT (UUID())`
        );
        await queryInterface.sequelize.query(
          `ALTER TABLE trip_cities ADD PRIMARY KEY (id)`
        );
        console.log(
          "  -> Added id CHAR(36) NOT NULL DEFAULT (UUID()) and PRIMARY KEY to trip_cities"
        );
        return;
      }

      const col = cols[0];
      const isChar36 =
        col.COLUMN_TYPE && col.COLUMN_TYPE.toLowerCase().includes("char(36)");
      const hasDefault = col.COLUMN_DEFAULT != null;
      const isPk = col.COLUMN_KEY === "PRI";

      if (!isChar36) {
        try {
          await queryInterface.sequelize.query(
            `ALTER TABLE trip_cities MODIFY COLUMN id CHAR(36) NOT NULL`
          );
          console.log("    -> Changed trip_cities.id to CHAR(36) NOT NULL");
        } catch (err) {
          console.warn(
            "    -> Could not change id type to CHAR(36):",
            err.message
          );
        }
      }

      if (!hasDefault) {
        try {
          await queryInterface.sequelize.query(
            `ALTER TABLE trip_cities MODIFY COLUMN id CHAR(36) NOT NULL DEFAULT (UUID())`
          );
          console.log("    -> Set DEFAULT UUID() on trip_cities.id");
        } catch (err) {
          console.warn(
            "    -> Could not set DEFAULT UUID() on trip_cities.id:",
            err.message
          );
        }
      }

      if (!isPk) {
        try {
          // Try to add primary key on id (will fail if other PK exists)
          await queryInterface.sequelize.query(
            `ALTER TABLE trip_cities ADD PRIMARY KEY (id)`
          );
          console.log("    -> Added PRIMARY KEY on trip_cities.id");
        } catch (err) {
          console.warn(
            "    -> Could not add PRIMARY KEY on trip_cities.id:",
            err.message
          );
          // As a fallback, ensure unique index exists
          try {
            await queryInterface.sequelize.query(
              `ALTER TABLE trip_cities ADD UNIQUE INDEX ux_trip_cities_id (id)`
            );
            console.log("    -> Added UNIQUE INDEX on trip_cities.id");
          } catch (e) {
            console.warn(
              "    -> Could not add UNIQUE INDEX on trip_cities.id:",
              e.message
            );
          }
        }
      }
    } catch (err) {
      console.error(
        "Error ensuring trip_cities.id is UUID + default + PK:",
        err.message
      );
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove default but keep CHAR(36) to avoid data issues; removing PK not safe
      await queryInterface.sequelize.query(
        `ALTER TABLE trip_cities MODIFY COLUMN id CHAR(36) NOT NULL`
      );
      console.log(
        "  -> Removed DEFAULT from trip_cities.id (kept CHAR(36) NOT NULL)"
      );
    } catch (err) {
      console.warn(
        "  -> Could not remove DEFAULT from trip_cities.id:",
        err.message
      );
    }
  },
};
