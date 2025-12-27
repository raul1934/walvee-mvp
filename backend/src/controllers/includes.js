const { User, City, Country, Place, PlacePhoto, CityPhoto } = require("../models/sequelize");

// Standard includes for common patterns

exports.INCLUDE_AUTHOR_FULL = {
  model: User,
  as: "author",
  attributes: ["id", "full_name", "preferred_name", "photo_url", "email", "bio"],
  include: [{
    model: City,
    as: "city",
    attributes: ["id", "name"],
    include: [{
      model: Country,
      as: "country",
      attributes: ["id", "name", "code"]
    }]
  }]
};

exports.INCLUDE_CITY_WITH_COUNTRY = {
  model: City,
  as: "city",
  attributes: ["id", "name", "state", "latitude", "longitude"],
  include: [{
    model: Country,
    as: "country",
    attributes: ["id", "name", "code"]
  }]
};

exports.INCLUDE_PLACE_FULL = {
  model: Place,
  as: "place",
  attributes: ["id", "name", "address", "latitude", "longitude", "rating", "google_place_id", "city_id"],
  include: [
    {
      model: PlacePhoto,
      as: "photos",
      attributes: ["id", "url", "photo_order"],
      limit: 3,
      separate: true,
      order: [["photo_order", "ASC"]]
    },
    {
      model: City,
      as: "city",
      attributes: ["id", "name", "state", "latitude", "longitude"],
      include: [{
        model: Country,
        as: "country",
        attributes: ["id", "name", "code"]
      }]
    }
  ]
};

exports.INCLUDE_TRIP_CITIES = {
  model: City,
  as: "cities",
  attributes: ["id", "name", "state"],
  include: [
    {
      model: Country,
      as: "country",
      attributes: ["id", "name", "code"]
    },
    {
      model: CityPhoto,
      as: "photos",
      attributes: ["id", "url", "photo_order"],
      limit: 3,
      separate: true,
      order: [["photo_order", "ASC"]]
    }
  ]
};
