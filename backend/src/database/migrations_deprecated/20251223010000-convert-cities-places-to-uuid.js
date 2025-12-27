"use strict";

const tablesToConvert = [
  {
    name: "countries",
    pk: "id",
  },
  {
    name: "cities",
    pk: "id",
  },
  {
    name: "places",
    pk: "id",
  },
  {
    name: "place_photos",
    pk: "id",
  },
  {
    name: "city_photos",
    pk: "id",
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration converts integer primary keys to CHAR(36) UUIDs and backfills
    // foreign key columns to use UUIDs. It is written defensively and should be
    // run during a maintenance window with a DB backup.

    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1) Add temporary UUID columns to primary tables
      for (const t of tablesToConvert) {
        const tableDescription = await queryInterface.describeTable(t.name);
        if (!tableDescription.id_uuid) {
          await queryInterface.addColumn(
            t.name,
            "id_uuid",
            { type: Sequelize.CHAR(36), allowNull: true },
            { transaction }
          );
        }

        // Backfill uuid values
        await queryInterface.sequelize.query(
          `UPDATE ${t.name} SET id_uuid = UUID() WHERE id_uuid IS NULL`,
          { transaction }
        );
      }

      // 2) Add UUID foreign key columns and fill them based on existing integer refs
      // countries -> cities.country_id
      const citiesTableDesc = await queryInterface.describeTable("cities");
      if (!citiesTableDesc.country_id_uuid) {
        await queryInterface.addColumn(
          "cities",
          "country_id_uuid",
          { type: Sequelize.CHAR(36), allowNull: true },
          { transaction }
        );
      }
      await queryInterface.sequelize.query(
        `UPDATE cities c JOIN countries co ON c.country_id = co.id SET c.country_id_uuid = co.id_uuid`,
        { transaction }
      );

      // places.city_id -> city_id_uuid
      const placesTableDesc = await queryInterface.describeTable("places");
      if (!placesTableDesc.city_id_uuid) {
        await queryInterface.addColumn(
          "places",
          "city_id_uuid",
          { type: Sequelize.CHAR(36), allowNull: true },
          { transaction }
        );
      }
      await queryInterface.sequelize.query(
        `UPDATE places p JOIN cities c ON p.city_id = c.id SET p.city_id_uuid = c.id_uuid`,
        { transaction }
      );

      // place_photos.place_id -> place_id_uuid
      const placePhotosTableDesc = await queryInterface.describeTable(
        "place_photos"
      );
      if (!placePhotosTableDesc.place_id_uuid) {
        await queryInterface.addColumn(
          "place_photos",
          "place_id_uuid",
          { type: Sequelize.CHAR(36), allowNull: true },
          { transaction }
        );
      }
      await queryInterface.sequelize.query(
        `UPDATE place_photos pp JOIN places p ON pp.place_id = p.id SET pp.place_id_uuid = p.id_uuid`,
        { transaction }
      );

      // city_photos.city_id -> city_id_uuid
      const cityPhotosTableDesc = await queryInterface.describeTable(
        "city_photos"
      );
      if (!cityPhotosTableDesc.city_id_uuid) {
        await queryInterface.addColumn(
          "city_photos",
          "city_id_uuid",
          { type: Sequelize.CHAR(36), allowNull: true },
          { transaction }
        );
      }
      await queryInterface.sequelize.query(
        `UPDATE city_photos cp JOIN cities c ON cp.city_id = c.id SET cp.city_id_uuid = c.id_uuid`,
        { transaction }
      );

      // 3) Drop foreign key constraints before modifying primary keys
      const fkConstraints = [
        { table: "cities", constraint: "cities_ibfk_1" },
        { table: "places", constraint: "places_ibfk_1" },
        { table: "place_photos", constraint: "place_photos_ibfk_1" },
        { table: "city_photos", constraint: "city_photos_ibfk_1" },
        { table: "city_reviews", constraint: "city_reviews_ibfk_1" },
        { table: "place_favorites", constraint: "place_favorites_ibfk_1" },
        { table: "trip_cities", constraint: "trip_cities_ibfk_2" },
        { table: "trip_itinerary_activities", constraint: "fk_activity_place" },
        { table: "trip_places", constraint: "trip_places_ibfk_2" },
        { table: "users", constraint: "users_ibfk_1" },
      ];

      for (const fk of fkConstraints) {
        try {
          await queryInterface.sequelize.query(
            `ALTER TABLE ${fk.table} DROP FOREIGN KEY ${fk.constraint}`,
            { transaction }
          );
        } catch (err) {
          // Constraint might not exist, continue
          console.log(
            `FK ${fk.constraint} on ${fk.table} not found or already dropped: ${err.message}`
          );
        }
      }

      // 4) Convert primary tables: drop old PK, rename id_uuid -> id
      // WARNING: dropping primary keys and renaming columns is destructive; do with backups
      for (const t of tablesToConvert) {
        const tableDesc = await queryInterface.describeTable(t.name);

        if (tableDesc.id_uuid) {
          // id_uuid column exists, need to convert
          let needsRename = true;

          if (tableDesc.id) {
            // Check if id is already UUID type
            const idType = tableDesc.id.type.toUpperCase();
            if (idType.includes("CHAR") && idType.includes("36")) {
              // Already UUID, just drop id_uuid
              needsRename = false;
              await queryInterface.sequelize.query(
                `ALTER TABLE ${t.name} DROP COLUMN id_uuid`,
                { transaction }
              );
            }
          }

          if (needsRename) {
            // Drop the old id column if it exists and is not UUID
            if (
              tableDesc.id &&
              !tableDesc.id.type.toUpperCase().includes("CHAR(36)")
            ) {
              // Remove auto_increment first
              await queryInterface.sequelize.query(
                `ALTER TABLE ${t.name} MODIFY COLUMN id INT NOT NULL`,
                { transaction }
              );
              // Drop primary key
              await queryInterface.sequelize.query(
                `ALTER TABLE ${t.name} DROP PRIMARY KEY`,
                { transaction }
              );
              // Drop old id column
              await queryInterface.sequelize.query(
                `ALTER TABLE ${t.name} DROP COLUMN id`,
                { transaction }
              );
            }

            // Rename id_uuid to id
            await queryInterface.sequelize.query(
              `ALTER TABLE ${t.name} CHANGE COLUMN id_uuid id CHAR(36) NOT NULL`,
              { transaction }
            );

            // Add primary key
            await queryInterface.sequelize.query(
              `ALTER TABLE ${t.name} ADD PRIMARY KEY (id)`,
              { transaction }
            );
          }
        }
      }

      // 4) Replace foreign key columns to use UUID names and types
      // cities.country_id -> country_id CHAR(36)
      await queryInterface.sequelize.query(
        `ALTER TABLE cities DROP COLUMN country_id`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE cities CHANGE COLUMN country_id_uuid country_id CHAR(36) NOT NULL`,
        { transaction }
      );

      // places.city_id
      await queryInterface.sequelize.query(
        `ALTER TABLE places DROP COLUMN city_id`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE places CHANGE COLUMN city_id_uuid city_id CHAR(36)`,
        { transaction }
      );

      // place_photos.place_id
      await queryInterface.sequelize.query(
        `ALTER TABLE place_photos DROP COLUMN place_id`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE place_photos CHANGE COLUMN place_id_uuid place_id CHAR(36) NOT NULL`,
        { transaction }
      );

      // city_photos.city_id
      await queryInterface.sequelize.query(
        `ALTER TABLE city_photos DROP COLUMN city_id`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE city_photos CHANGE COLUMN city_id_uuid city_id CHAR(36) NOT NULL`,
        { transaction }
      );

      // 5) Add foreign key constraints where possible
      await queryInterface.sequelize.query(
        `ALTER TABLE cities ADD CONSTRAINT fk_cities_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE places ADD CONSTRAINT fk_places_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE place_photos ADD CONSTRAINT fk_place_photos_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE city_photos ADD CONSTRAINT fk_city_photos_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE`,
        { transaction }
      );

      // Add back additional FKs
      await queryInterface.sequelize.query(
        `ALTER TABLE city_reviews ADD CONSTRAINT fk_city_reviews_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE place_favorites ADD CONSTRAINT fk_place_favorites_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE trip_cities ADD CONSTRAINT fk_trip_cities_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE trip_itinerary_activities ADD CONSTRAINT fk_trip_itinerary_activities_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE trip_places ADD CONSTRAINT fk_trip_places_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE users ADD CONSTRAINT fk_users_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL`,
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Reversing this migration is non-trivial and not fully supported by the script.
    // In practice, restore from backup if you need to revert.
    console.warn(
      "Down for convert-cities-places-to-uuid is a no-op. Restore DB from backup to revert."
    );
  },
};
