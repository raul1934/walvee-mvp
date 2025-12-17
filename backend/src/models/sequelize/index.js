const { sequelize } = require("../../database/sequelize");
const User = require("./User");
const Trip = require("./Trip");
const TripTag = require("./TripTag");
const TripPlace = require("./TripPlace");
const TripItineraryDay = require("./TripItineraryDay");
const TripItineraryActivity = require("./TripItineraryActivity");
const TripLike = require("./TripLike");
const Follow = require("./Follow");

// Define associations
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

User.hasMany(Follow, { foreignKey: "follower_id", as: "following" });
User.hasMany(Follow, { foreignKey: "followee_id", as: "followers" });
Follow.belongsTo(User, { foreignKey: "follower_id", as: "follower" });
Follow.belongsTo(User, { foreignKey: "followee_id", as: "followee" });

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
};
