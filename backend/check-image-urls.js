const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("walvee", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

async function checkImageUrls() {
  try {
    // Check city photos
    const [cityPhotos] = await sequelize.query(
      'SELECT url_small FROM city_photos WHERE url_small LIKE "/images/%" LIMIT 5'
    );
    console.log("City photo URLs:");
    cityPhotos.forEach((photo) => console.log(" ", photo.url_small));

    // Check place photos
    const [placePhotos] = await sequelize.query(
      'SELECT url_small FROM place_photos WHERE url_small LIKE "/images/%" LIMIT 5'
    );
    console.log("\nPlace photo URLs:");
    placePhotos.forEach((photo) => console.log(" ", photo.url_small));

    // Check user photos
    const [userPhotos] = await sequelize.query(
      'SELECT photo_url FROM users WHERE photo_url LIKE "/images/%" LIMIT 5'
    );
    console.log("\nUser photo URLs:");
    userPhotos.forEach((user) => console.log(" ", user.photo_url));
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}

checkImageUrls();
