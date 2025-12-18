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
const TripComment = require("./TripComment");
const Country = require("./Country");
const City = require("./City");
const Place = require("./Place");
const PlacePhoto = require("./PlacePhoto");

// Define associations
Country.hasMany(City, { foreignKey: "country_id", as: "cities" });
City.belongsTo(Country, { foreignKey: "country_id", as: "country" });

User.belongsTo(City, { foreignKey: "city_id", as: "cityData" });
City.hasMany(User, { foreignKey: "city_id", as: "users" });

Trip.belongsTo(City, {
  foreignKey: "destination_city_id",
  as: "destinationCity",
});
City.hasMany(Trip, { foreignKey: "destination_city_id", as: "trips" });
User.hasMany(Trip, { foreignKey: "author_id", as: "trips" });
Trip.belongsTo(User, { foreignKey: "author_id", as: "author" });

Trip.hasMany(TripTag, { foreignKey: "trip_id", as: "tags" });
TripTag.belongsTo(Trip, { foreignKey: "trip_id" });

Trip.hasMany(TripPlace, { foreignKey: "trip_id", as: "places" });
TripPlace.belongsTo(Trip, { foreignKey: "trip_id" });

Trip.hasMany(TripItineraryDay, { foreignKey: "trip_id", as: "itineraryDays" });
TripItineraryDay.belongsTo(Trip, { foreignKey: "trip_id" });

TripItineraryDay.hasMany(TripItineraryActivity, {
  foreignKey: "itinerary_day_id",
  as: "activities",
});
TripItineraryActivity.belongsTo(TripItineraryDay, {
  foreignKey: "itinerary_day_id",
});

Trip.hasMany(TripLike, { foreignKey: "trip_id", as: "likes" });
TripLike.belongsTo(Trip, { foreignKey: "trip_id" });

User.hasMany(TripLike, { foreignKey: "liker_id", as: "likedTrips" });
TripLike.belongsTo(User, { foreignKey: "liker_id", as: "liker" });

// Follows (user_follow table): followee_id = user being followed, follower_id = follower
User.hasMany(Follow, { foreignKey: "follower_id", as: "following" });
User.hasMany(Follow, { foreignKey: "followee_id", as: "followers" });
Follow.belongsTo(User, { foreignKey: "follower_id", as: "follower" });
Follow.belongsTo(User, { foreignKey: "followee_id", as: "followee" });

Trip.hasMany(TripSteal, { foreignKey: "original_trip_id", as: "steals" });
TripSteal.belongsTo(Trip, {
  foreignKey: "original_trip_id",
  as: "originalTrip",
});
TripSteal.belongsTo(Trip, { foreignKey: "new_trip_id", as: "newTrip" });

User.hasMany(TripSteal, { foreignKey: "original_user_id", as: "tripsStolen" });
User.hasMany(TripSteal, { foreignKey: "new_user_id", as: "stolenTrips" });
TripSteal.belongsTo(User, {
  foreignKey: "original_user_id",
  as: "originalUser",
});
TripSteal.belongsTo(User, { foreignKey: "new_user_id", as: "newUser" });

Trip.hasMany(Review, { foreignKey: "trip_id", as: "reviews" });
Review.belongsTo(Trip, { foreignKey: "trip_id" });

Trip.hasMany(TripComment, { foreignKey: "trip_id", as: "comments" });
TripComment.belongsTo(Trip, { foreignKey: "trip_id" });

User.hasMany(Review, { foreignKey: "reviewer_id", as: "reviews" });
Review.belongsTo(User, { foreignKey: "reviewer_id", as: "reviewer" });

User.hasMany(TripComment, { foreignKey: "user_id", as: "comments" });
TripComment.belongsTo(User, { foreignKey: "user_id", as: "commenter" });

// Place associations
City.hasMany(Place, { foreignKey: "city_id", as: "places" });
Place.belongsTo(City, { foreignKey: "city_id", as: "city" });

Place.hasMany(PlacePhoto, { foreignKey: "place_id", as: "photos" });
PlacePhoto.belongsTo(Place, { foreignKey: "place_id", as: "place" });

TripPlace.belongsTo(Place, { foreignKey: "place_id", as: "placeDetails" });
Place.hasMany(TripPlace, { foreignKey: "place_id", as: "tripPlaces" });

TripItineraryActivity.belongsTo(Place, { foreignKey: "place_id", as: "placeDetails" });
Place.hasMany(TripItineraryActivity, { foreignKey: "place_id", as: "itineraryActivities" });

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
  Review,
  TripComment,
  Country,
  City,
  Place,
  PlacePhoto,
};
