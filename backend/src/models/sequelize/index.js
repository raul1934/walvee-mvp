const { sequelize } = require("../../database/sequelize");
const User = require("./User");
const Trip = require("./Trip");
const TripTag = require("./TripTag");
const TripPlace = require("./TripPlace");
const TripItineraryDay = require("./TripItineraryDay");
const TripItineraryActivity = require("./TripItineraryActivity");
const TripLike = require("./TripLike");
const Follow = require("./Follow");
const TripSteal = require("./TripSteal");
const Review = require("./Review");
const PlaceReview = require("./PlaceReview");
const TripReview = require("./TripReview");
const CityReview = require("./CityReview");
const TripComment = require("./TripComment");
const Country = require("./Country");
const City = require("./City");
const Place = require("./Place");
const PlacePhoto = require("./PlacePhoto");
const CityPhoto = require("./CityPhoto");
const PlaceFavorite = require("./PlaceFavorite");
const TripImage = require("./TripImage");
const ChatMessage = require("./ChatMessage");

let modelsInitialized = false;

function initModels() {
  if (modelsInitialized) return;

  // Define associations
  Country.hasMany(City, { foreignKey: "country_id", as: "cities", onDelete: "CASCADE" });
  City.belongsTo(Country, { foreignKey: "country_id", as: "country" });

  User.belongsTo(City, { foreignKey: "city_id", as: "city" });
  City.hasMany(User, { foreignKey: "city_id", as: "users" });

  // `destination_city_id` column deprecated - use many-to-many `trip_cities` instead
  // New many-to-many: trips can have multiple cities
  Trip.belongsToMany(City, {
    through: {
      model: "trip_cities",
      attributes: ["city_order"],
      timestamps: false,
    },
    foreignKey: "trip_id",
    otherKey: "city_id",
    as: "cities",
  });
  City.belongsToMany(Trip, {
    through: {
      model: "trip_cities",
      attributes: ["city_order"],
      timestamps: false,
    },
    foreignKey: "city_id",
    otherKey: "trip_id",
    as: "tripsMany",
  });
  User.hasMany(Trip, { foreignKey: "author_id", as: "trips", onDelete: "CASCADE" });
  Trip.belongsTo(User, { foreignKey: "author_id", as: "author" });

  Trip.hasMany(TripTag, { foreignKey: "trip_id", as: "tags", onDelete: "CASCADE" });
  TripTag.belongsTo(Trip, { foreignKey: "trip_id" });

  Trip.hasMany(TripPlace, { foreignKey: "trip_id", as: "places", onDelete: "CASCADE" });
  TripPlace.belongsTo(Trip, { foreignKey: "trip_id" });

  Trip.hasMany(TripItineraryDay, {
    foreignKey: "trip_id",
    as: "itineraryDays",
    onDelete: "CASCADE",
  });
  TripItineraryDay.belongsTo(Trip, { foreignKey: "trip_id" });

  // City-TripItineraryDay association
  TripItineraryDay.belongsTo(City, {
    foreignKey: "city_id",
    as: "city",
  });
  City.hasMany(TripItineraryDay, {
    foreignKey: "city_id",
    as: "itineraryDays",
  });

  TripItineraryDay.hasMany(TripItineraryActivity, {
    foreignKey: "itinerary_day_id",
    as: "activities",
    onDelete: "CASCADE",
  });
  TripItineraryActivity.belongsTo(TripItineraryDay, {
    foreignKey: "itinerary_day_id",
  });

  Trip.hasMany(TripLike, { foreignKey: "trip_id", as: "likes", onDelete: "CASCADE" });
  TripLike.belongsTo(Trip, { foreignKey: "trip_id" });

  User.hasMany(TripLike, { foreignKey: "liker_id", as: "likedTrips", onDelete: "CASCADE" });
  TripLike.belongsTo(User, { foreignKey: "liker_id", as: "liker" });

  // Follows (user_follow table): followee_id = user being followed, follower_id = follower
  User.hasMany(Follow, { foreignKey: "follower_id", as: "following", onDelete: "CASCADE" });
  User.hasMany(Follow, { foreignKey: "followee_id", as: "followers", onDelete: "CASCADE" });
  Follow.belongsTo(User, { foreignKey: "follower_id", as: "follower" });
  Follow.belongsTo(User, { foreignKey: "followee_id", as: "followee" });

  Trip.hasMany(TripSteal, { foreignKey: "original_trip_id", as: "steals", onDelete: "CASCADE" });
  TripSteal.belongsTo(Trip, {
    foreignKey: "original_trip_id",
    as: "originalTrip",
  });
  TripSteal.belongsTo(Trip, { foreignKey: "new_trip_id", as: "newTrip", onDelete: "CASCADE" });

  User.hasMany(TripSteal, {
    foreignKey: "original_user_id",
    as: "tripsStolen",
    onDelete: "CASCADE",
  });
  User.hasMany(TripSteal, { foreignKey: "new_user_id", as: "stolenTrips", onDelete: "CASCADE" });
  TripSteal.belongsTo(User, {
    foreignKey: "original_user_id",
    as: "originalUser",
  });
  TripSteal.belongsTo(User, { foreignKey: "new_user_id", as: "newUser" });

  // Old Review associations (to be deprecated)
  Trip.hasMany(Review, { foreignKey: "trip_id", as: "reviews", onDelete: "CASCADE" });
  Review.belongsTo(Trip, { foreignKey: "trip_id" });
  User.hasMany(Review, { foreignKey: "reviewer_id", as: "reviews", onDelete: "CASCADE" });
  Review.belongsTo(User, { foreignKey: "reviewer_id", as: "reviewer" });

  // New Review associations
  // PlaceReview associations
  User.hasMany(PlaceReview, { foreignKey: "reviewer_id", as: "placeReviews", onDelete: "CASCADE" });
  PlaceReview.belongsTo(User, { foreignKey: "reviewer_id", as: "reviewer" });

  // TripReview associations
  Trip.hasMany(TripReview, { foreignKey: "trip_id", as: "tripReviews", onDelete: "CASCADE" });
  TripReview.belongsTo(Trip, { foreignKey: "trip_id", as: "trip" });
  User.hasMany(TripReview, { foreignKey: "reviewer_id", as: "tripReviews", onDelete: "CASCADE" });
  TripReview.belongsTo(User, { foreignKey: "reviewer_id", as: "reviewer" });

  // CityReview associations
  City.hasMany(CityReview, { foreignKey: "city_id", as: "cityReviews", onDelete: "CASCADE" });
  CityReview.belongsTo(City, { foreignKey: "city_id", as: "city" });
  User.hasMany(CityReview, { foreignKey: "reviewer_id", as: "cityReviews", onDelete: "CASCADE" });
  CityReview.belongsTo(User, { foreignKey: "reviewer_id", as: "reviewer" });

  // Trip Comments
  Trip.hasMany(TripComment, { foreignKey: "trip_id", as: "comments", onDelete: "CASCADE" });
  TripComment.belongsTo(Trip, { foreignKey: "trip_id" });
  User.hasMany(TripComment, { foreignKey: "user_id", as: "comments", onDelete: "CASCADE" });
  TripComment.belongsTo(User, { foreignKey: "user_id", as: "commenter" });

  // Place associations
  City.hasMany(Place, { foreignKey: "city_id", as: "places", onDelete: "CASCADE" });
  Place.belongsTo(City, { foreignKey: "city_id", as: "city" });

  Place.hasMany(PlacePhoto, { foreignKey: "place_id", as: "photos", onDelete: "CASCADE" });
  PlacePhoto.belongsTo(Place, { foreignKey: "place_id", as: "place" });

  // City Photo associations
  City.hasMany(CityPhoto, { foreignKey: "city_id", as: "photos", onDelete: "CASCADE" });
  CityPhoto.belongsTo(City, { foreignKey: "city_id", as: "city" });

  TripPlace.belongsTo(Place, { foreignKey: "place_id", as: "place" });
  Place.hasMany(TripPlace, { foreignKey: "place_id", as: "tripPlaces" });

  TripItineraryActivity.belongsTo(Place, {
    foreignKey: "place_id",
    as: "place",
  });
  Place.hasMany(TripItineraryActivity, {
    foreignKey: "place_id",
    as: "itineraryActivities",
  });

  // Place Favorite associations
  User.hasMany(PlaceFavorite, { foreignKey: "user_id", as: "placeFavorites", onDelete: "CASCADE" });
  PlaceFavorite.belongsTo(User, { foreignKey: "user_id", as: "user" });
  Place.hasMany(PlaceFavorite, { foreignKey: "place_id", as: "favorites", onDelete: "CASCADE" });
  PlaceFavorite.belongsTo(Place, { foreignKey: "place_id", as: "place" });

  // Trip Image associations
  Trip.hasMany(TripImage, { foreignKey: "trip_id", as: "images", onDelete: "CASCADE" });
  TripImage.belongsTo(Trip, { foreignKey: "trip_id", as: "trip" });
  PlacePhoto.hasMany(TripImage, { foreignKey: "place_photo_id", as: "tripImages" });
  TripImage.belongsTo(PlacePhoto, { foreignKey: "place_photo_id", as: "placePhoto" });
  CityPhoto.hasMany(TripImage, { foreignKey: "city_photo_id", as: "tripImages" });
  TripImage.belongsTo(CityPhoto, { foreignKey: "city_photo_id", as: "cityPhoto" });

  // Chat Message associations
  Trip.hasMany(ChatMessage, { foreignKey: "trip_id", as: "chatMessages", onDelete: "CASCADE" });
  ChatMessage.belongsTo(Trip, { foreignKey: "trip_id", as: "trip" });
  City.hasMany(ChatMessage, { foreignKey: "city_id", as: "chatMessages" });
  ChatMessage.belongsTo(City, { foreignKey: "city_id", as: "city" });

  // Add restore hooks for cascade restore behavior

  // When a Trip is restored, restore all its related records
  Trip.addHook('afterRestore', async (trip, options) => {
    const transaction = options.transaction;

    await TripTag.restore({ where: { trip_id: trip.id }, transaction });
    await TripPlace.restore({ where: { trip_id: trip.id }, transaction });
    await TripItineraryDay.restore({ where: { trip_id: trip.id }, transaction });
    await TripLike.restore({ where: { trip_id: trip.id }, transaction });
    await TripSteal.restore({ where: { original_trip_id: trip.id }, transaction });
    await TripSteal.restore({ where: { new_trip_id: trip.id }, transaction });
    await Review.restore({ where: { trip_id: trip.id }, transaction });
    await TripReview.restore({ where: { trip_id: trip.id }, transaction });
    await TripComment.restore({ where: { trip_id: trip.id }, transaction });
    await TripImage.restore({ where: { trip_id: trip.id }, transaction });
    await ChatMessage.restore({ where: { trip_id: trip.id }, transaction });
  });

  // When a TripItineraryDay is restored, restore its activities
  TripItineraryDay.addHook('afterRestore', async (day, options) => {
    const transaction = options.transaction;
    await TripItineraryActivity.restore({ where: { itinerary_day_id: day.id }, transaction });
  });

  // When a User is restored, restore all their related records
  User.addHook('afterRestore', async (user, options) => {
    const transaction = options.transaction;

    await Trip.restore({ where: { author_id: user.id }, transaction });
    await TripLike.restore({ where: { liker_id: user.id }, transaction });
    await Follow.restore({ where: { follower_id: user.id }, transaction });
    await Follow.restore({ where: { followee_id: user.id }, transaction });
    await TripSteal.restore({ where: { original_user_id: user.id }, transaction });
    await TripSteal.restore({ where: { new_user_id: user.id }, transaction });
    await Review.restore({ where: { reviewer_id: user.id }, transaction });
    await PlaceReview.restore({ where: { reviewer_id: user.id }, transaction });
    await TripReview.restore({ where: { reviewer_id: user.id }, transaction });
    await CityReview.restore({ where: { reviewer_id: user.id }, transaction });
    await TripComment.restore({ where: { user_id: user.id }, transaction });
    await PlaceFavorite.restore({ where: { user_id: user.id }, transaction });
  });

  // When a City is restored, restore all its related records
  City.addHook('afterRestore', async (city, options) => {
    const transaction = options.transaction;

    await Place.restore({ where: { city_id: city.id }, transaction });
    await CityPhoto.restore({ where: { city_id: city.id }, transaction });
    await CityReview.restore({ where: { city_id: city.id }, transaction });
    await TripItineraryDay.restore({ where: { city_id: city.id }, transaction });
    await ChatMessage.restore({ where: { city_id: city.id }, transaction });
  });

  // When a Country is restored, restore all its cities (which will cascade via hooks)
  Country.addHook('afterRestore', async (country, options) => {
    const transaction = options.transaction;
    await City.restore({ where: { country_id: country.id }, transaction });
  });

  // When a Place is restored, restore all its related records
  Place.addHook('afterRestore', async (place, options) => {
    const transaction = options.transaction;

    await PlacePhoto.restore({ where: { place_id: place.id }, transaction });
    await PlaceFavorite.restore({ where: { place_id: place.id }, transaction });
  });

  modelsInitialized = true;
}

module.exports = {
  sequelize,
  User,
  Trip,
  TripTag,
  TripPlace,
  TripItineraryDay,
  TripItineraryActivity,
  TripLike,
  Follow,
  TripSteal,
  Review, // Old model - to be deprecated
  PlaceReview,
  TripReview,
  CityReview,
  TripComment,
  Country,
  City,
  Place,
  PlacePhoto,
  CityPhoto,
  PlaceFavorite,
  TripImage,
  ChatMessage,
  initModels,
};
