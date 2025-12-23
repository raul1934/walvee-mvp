require("dotenv").config({
  path: require("path").resolve(__dirname, "..", ".env"),
});
const models = require("../src/models/sequelize");
const {
  Trip,
  User,
  City,
  Country,
  CityPhoto,
  Place,
  PlacePhoto,
  TripItineraryDay,
  TripItineraryActivity,
} = models;
// Ensure associations are initialized
models.initModels();
const { sequelize } = require("../src/database/sequelize");

async function run() {
  try {
    // Reproduce inner derived select to test correlated subquery
    const innerSQL = `SELECT Trip.id, Trip.title, Trip.description, Trip.duration, Trip.budget, Trip.is_public, Trip.cover_image, (
      SELECT COUNT(*) FROM trip_likes tl WHERE tl.trip_id = Trip.id
    ) AS likes_count, Trip.views_count, Trip.created_at, Trip.author_id FROM trips AS Trip ORDER BY RAND() LIMIT 5`;

    try {
      const [rows] = await sequelize.query(innerSQL);
      console.log("Inner select success, rows:", rows.length);
    } catch (err) {
      console.error(
        "Inner select failed:",
        err && err.original
          ? err.original.sqlMessage || err.original.message
          : err
      );
    }

    // Check collations for involved id columns to diagnose 'Illegal mix of collations' error
    const cols = [
      { table: "trip_cities", col: "city_id" },
      { table: "cities", col: "id" },
      { table: "users", col: "id" },
      { table: "trips", col: "author_id" },
      { table: "countries", col: "id" },
    ];
    for (const c of cols) {
      const [[info]] = await sequelize.query(
        `SELECT COLUMN_NAME, COLLATION_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        { replacements: [c.table, c.col] }
      );
      console.log(`Collation for ${c.table}.${c.col}:`, info);
    }

    // Now run original Trip.findAll to reproduce full error
    try {
      const trips = await Trip.findAll({
        order: sequelize.random(),
        limit: 5,
        attributes: [
          "id",
          "title",
          "description",
          "duration",
          "budget",
          "is_public",
          "cover_image",
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM trip_likes tl WHERE tl.trip_id = Trip.id
            )`),
            "likes_count",
          ],
          "views_count",
          "created_at",
        ],
        include: [
          { model: User, as: "author", attributes: ["id", "full_name"] },
          {
            model: require("../src/models/sequelize").City,
            as: "cities",
            attributes: ["id", "name"],
            include: [
              { model: Country, as: "country", attributes: ["id", "name"] },
              {
                model: CityPhoto,
                as: "photos",
                attributes: ["url_small"],
                limit: 1,
              },
            ],
            through: { attributes: ["city_order"], timestamps: false },
            required: false,
          },
        ],
      });

      console.log("FindAll success, got", trips.length);
    } catch (err) {
      console.error(
        "FindAll failed:",
        err &&
          (err.original?.sqlMessage ||
            err.original?.message ||
            err.message ||
            err)
      );
    }
  } catch (err) {
    console.error("Query failed:", err && err.stack ? err.stack : err);
  } finally {
    process.exit(0);
  }
}

run();
