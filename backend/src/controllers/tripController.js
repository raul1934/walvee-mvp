const {
  Trip,
  User,
  TripTag,
  TripPlace,
  TripItineraryDay,
  TripItineraryActivity,
  TripLike,
  TripSteal,
  TripReview,
  Place,
  PlacePhoto,
  City,
  Country,
  CityPhoto,
  TripImage,
  TripComment,
} = require("../models/sequelize");
const { Op, sequelize } = require("sequelize");
const { sequelize: dbSequelize } = require("../database/sequelize");
const { v4: uuidv4 } = require("uuid");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
  getFullImageUrl,
} = require("../utils/helpers");
const { addUserContext } = require("../utils/userContext");
const {
  INCLUDE_CITY_WITH_COUNTRY,
  INCLUDE_TRIP_CITIES,
} = require("./includes");
const getTrips = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      sortBy = "created_at",
      order = "desc",
      destination,
      createdBy,
      isPublic,
      minLikes,
      search,
    } = req.query;

    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const where = {};

    // Filter out draft trips - only show drafts to the owner
    const userId = req.user?.id;
    if (createdBy && userId && createdBy === userId) {
      // User is viewing their own trips - show both published and drafts
      // No is_draft filter needed
    } else {
      // Public view or viewing other user's trips - hide drafts
      where.is_draft = false;
    }

    // Note: destination filter will be applied on the cities relation below when tripInclude is constructed

    if (createdBy) {
      where.author_id = createdBy;
    }

    if (isPublic !== undefined && isPublic !== "") {
      where.is_public = isPublic === "true" || isPublic === true;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    let tripInclude = [
      {
        model: User,
        as: "author",
        attributes: ["id", "full_name", "preferred_name", "photo_url", "email"],
      },
      { model: TripTag, as: "tags", attributes: ["tag"] },
      {
        model: TripPlace,
        as: "places",
        attributes: [
          "id",
          "name",
          "address",
          "rating",
          "price_level",
          "types",
          "description",
          "created_at",
        ],
        include: [
          {
            model: Place,
            as: "place",
            attributes: [
              "id",
              "latitude",
              "longitude",
              "rating",
              "user_ratings_total",
              "google_place_id",
              "city_id",
            ],
            include: [
              {
                model: PlacePhoto,
                as: "photos",
                attributes: ["url_small", "url_medium", "url_large", "photo_order"],
                order: [["photo_order", "ASC"]],
              },
            ],
          },
        ],
      },
      // include cities for filtering by destination and for responses
      {
        model: City,
        as: "cities",
        attributes: ["id", "name"],
        include: [
          { model: Country, as: "country", attributes: ["id", "name", "code"] },
        ],
        through: { attributes: ["city_order"], timestamps: false },
        required: false,
      },
      {
        model: TripItineraryDay,
        as: "itineraryDays",
        attributes: ["id", "day_number", "title", "description"],
        include: [
          {
            model: TripItineraryActivity,
            as: "activities",
            attributes: [
              "time",
              "name",
              "location",
              "description",
              "activity_order",
              "place_id",
            ],
            include: [
              {
                model: Place,
                as: "place",
                attributes: [
                  "id",
                  "latitude",
                  "longitude",
                  "rating",
                  "user_ratings_total",
                  "google_place_id",
                  "name",
                  "address",
                  "price_level",
                ],
                include: [
                  {
                    model: PlacePhoto,
                    as: "photos",
                    attributes: [
                      "url_small",
                      "url_medium",
                      "url_large",
                      "photo_order",
                    ],
                    order: [["photo_order", "ASC"]],
                  },
                  {
                    model: City,
                    as: "city",
                    attributes: ["id", "name"],
                    include: [
                      {
                        model: Country,
                        as: "country",
                        attributes: ["id", "name", "code"],
                      },
                    ],
                    required: false,
                  },
                ],
              },
            ],
            order: [["activity_order", "ASC"]],
          },
        ],
        order: [["day_number", "ASC"]],
      },
      // Include likes for counting
      {
        model: TripLike,
        as: "likes",
        attributes: ["id"],
        required: false,
      },
    ];

    // If destination filter provided, require a matching city
    if (destination) {
      tripInclude = tripInclude.map((inc) => {
        if (inc.as === "cities") {
          return {
            ...inc,
            where: { name: { [Op.like]: `%${destination}%` } },
            attributes: [],
            required: true,
          };
        }
        return inc;
      });
    }

    const count = await Trip.count({
      where,
      include: tripInclude.filter(inc => inc.as !== 'likes'),
      distinct: true,
    });

    // Fetch trips with likes included
    let trips = await Trip.findAll({
      where,
      include: tripInclude,
      offset,
      limit: limitNum,
      order: sortBy === "likes_count"
        ? [["created_at", "DESC"]] // Temporary - will sort by likes_count after fetching
        : [[sortBy, order.toUpperCase()]],
    });

    // Add likes_count to each trip and filter/sort
    trips = trips.map(trip => {
      trip.dataValues.likes_count = trip.likes ? trip.likes.length : 0;
      return trip;
    });

    // Filter by minLikes if specified
    if (minLikes) {
      trips = trips.filter(trip => trip.dataValues.likes_count >= parseInt(minLikes));
    }

    // Sort by likes_count if requested
    if (sortBy === "likes_count") {
      trips.sort((a, b) => {
        const comparison = b.dataValues.likes_count - a.dataValues.likes_count;
        return order === "asc" ? -comparison : comparison;
      });
    }

    // Add user context
    const tripsWithContext = await addUserContext(trips, userId, {
      includeLikes: true,
      includeFollows: true,
    });

    // Format the response
    const formattedTrips = await Promise.all(
      tripsWithContext.map((trip) => formatTripResponse(trip))
    );

    const pagination = buildPaginationMeta(pageNum, limitNum, count);

    res.json(buildSuccessResponse(formattedTrips, pagination));
  } catch (error) {
    console.error("[Get Trips] Error:", error.stack || error.message);
    next(error);
  }
};

const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: [
            "id",
            "full_name",
            "preferred_name",
            "photo_url",
            "email",
            "bio",
          ],
        },
        {
          model: City,
          as: "cities",
          attributes: ["id", "name"],
          through: { attributes: ["city_order"], timestamps: false },
          include: [
            {
              model: Country,
              as: "country",
              // Include id and code so clients can receive a nested country object
              attributes: ["id", "name", "code"],
            },
            {
              model: CityPhoto,
              as: "photos",
              attributes: ["id", "url_small", "url_medium", "url_large"],
            },
          ],
        },
        {
          model: TripTag,
          as: "tags",
          attributes: ["tag"],
        },
        {
          model: TripPlace,
          as: "places",
          attributes: [
            "id",
            "name",
            "address",
            "rating",
            "price_level",
            "types",
            "description",
            "created_at",
          ],
          include: [
            {
              model: Place,
              as: "place",
              attributes: [
                "id",
                "latitude",
                "longitude",
                "rating",
                "user_ratings_total",
                "google_place_id",
                "city_id",
              ],
              include: [
                {
                  model: PlacePhoto,
                  as: "photos",
                  attributes: ["id", "url_small", "url_medium", "url_large", "photo_order"],
                  order: [["photo_order", "ASC"]],
                },
              ],
            },
          ],
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          attributes: ["id", "day_number", "title", "description"],
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
              attributes: [
                "time",
                "name",
                "location",
                "description",
                "activity_order",
                "place_id",
              ],
              include: [
                {
                  model: Place,
                  as: "place",
                  attributes: [
                    "id",
                    "latitude",
                    "longitude",
                    "rating",
                    "user_ratings_total",
                    "google_place_id",
                    "name",
                    "address",
                    "price_level",
                  ],
                  include: [
                    {
                      model: PlacePhoto,
                      as: "photos",
                      attributes: ["url_small", "url_medium", "url_large"],
                      limit: 3,
                    },
                  ],
                },
              ],
            },
          ],
          order: [["day_number", "ASC"]],
        },
        {
          model: TripComment,
          as: "comments",
          include: [
            {
              model: User,
              as: "commenter",
              attributes: ["id", "preferred_name", "full_name", "photo_url"],
            },
          ],
          limit: 10,
          order: [["created_at", "DESC"]],
        },
        {
          model: TripImage,
          as: "images",
          attributes: [
            "id",
            "place_photo_id",
            "city_photo_id",
            "is_cover",
            "image_order",
          ],
          include: [
            {
              model: PlacePhoto,
              as: "placePhoto",
              attributes: ["id", "url_small", "url_medium", "url_large"],
            },
            {
              model: CityPhoto,
              as: "cityPhoto",
              attributes: ["id", "url_small", "url_medium", "url_large"],
            },
          ],
          order: [["image_order", "ASC"]],
        },
        {
          model: TripLike,
          as: "likes",
          attributes: ["id"],
          required: false,
        },
      ],
    });

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    // Add likes_count as a virtual property
    trip.dataValues.likes_count = trip.likes ? trip.likes.length : 0;

    // Check if trip is draft and user is not the owner
    const userId = req.user?.id;
    if (trip.is_draft && trip.author_id !== userId) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    // Increment views (only for non-draft or owner viewing their own draft)
    if (!trip.is_draft || trip.author_id === userId) {
      await trip.increment("views_count");
    }

    // Add user context (likes/follows)
    const [tripWithContext] = await addUserContext([trip], userId, {
      includeLikes: true,
      includeFollows: true,
    });

    // formatTripResponse is async — await its result before sending
    const formatted = await formatTripResponse(tripWithContext || trip);
    res.json(buildSuccessResponse(formatted));
  } catch (error) {
    next(error);
  }
};

const createTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tags, places, itinerary, cities, trip_images, ...tripData } =
      req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "User not found"));
    }

    // Create trip
    const trip = await Trip.create({
      ...tripData,
      author_id: userId,
    });

    // Create trip_cities entries if cities array provided
    if (cities && Array.isArray(cities) && cities.length > 0) {
      // Extract city UUIDs from objects (cities must be [{id: uuid}] format)
      const cityIds = cities.map((c) => c.id).filter(Boolean);
      for (let i = 0; i < cityIds.length; i++) {
        const cityId = cityIds[i];
        await Trip.sequelize.query(
          "INSERT INTO trip_cities (id, trip_id, city_id, city_order, created_at) VALUES (?, ?, ?, ?, NOW())",
          { replacements: [uuidv4(), trip.id, cityId, i] }
        );
      }
      // backward compatibility: previously stored first city in destination_city_id
      // we now rely on the trip_cities relation, so no update is necessary.
    }

    // Create tags
    if (tags && tags.length > 0) {
      await TripTag.bulkCreate(tags.map((tag) => ({ trip_id: trip.id, tag })));
    }

    // Create places
    if (places && places.length > 0) {
      await TripPlace.bulkCreate(
        places.map((place) => ({ trip_id: trip.id, ...place }))
      );
    }

    // Create itinerary
    if (itinerary && itinerary.length > 0) {
      for (const day of itinerary) {
        const itineraryDay = await TripItineraryDay.create({
          trip_id: trip.id,
          day_number: day.day,
          title: day.title,
        });

        if (day.activities && day.activities.length > 0) {
          await TripItineraryActivity.bulkCreate(
            day.activities.map((activity, index) => ({
              itinerary_day_id: itineraryDay.id,
              ...activity,
              activity_order: index,
            }))
          );
        }
      }
    }

    // Create trip images
    if (trip_images && Array.isArray(trip_images) && trip_images.length > 0) {
      await TripImage.bulkCreate(
        trip_images.map((img, index) => ({
          trip_id: trip.id,
          place_photo_id: img.place_photo_id || null,
          city_photo_id: img.city_photo_id || null,
          is_cover: img.is_cover || false,
          image_order: img.image_order !== undefined ? img.image_order : index,
        }))
      );
    }

    // Fetch the complete trip with associations
    const completeTripData = await Trip.findByPk(trip.id, {
      include: [
        { model: User, as: "author" },
        { model: TripTag, as: "tags" },
        {
          model: TripPlace,
          as: "places",
          include: [
            {
              model: Place,
              as: "place",
              attributes: [
                "id",
                "latitude",
                "longitude",
                "rating",
                "user_ratings_total",
                "google_place_id",
              ],
            },
          ],
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
              include: [
                {
                  model: Place,
                  as: "place",
                  attributes: [
                    "id",
                    "latitude",
                    "longitude",
                    "rating",
                    "user_ratings_total",
                    "google_place_id",
                    "name",
                    "address",
                    "price_level",
                  ],
                  include: [
                    {
                      model: PlacePhoto,
                      as: "photos",
                      attributes: [
                        "url_small",
                        "url_medium",
                        "url_large",
                        "photo_order",
                      ],
                      order: [["photo_order", "ASC"]],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    res
      .status(201)
      .json(buildSuccessResponse(await formatTripResponse(completeTripData)));
  } catch (error) {
    next(error);
  }
};

const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { tags, places, itinerary, cities, trip_images, ...tripData } =
      req.body;

    const trip = await Trip.findByPk(id);

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    if (trip.author_id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to update this trip"
          )
        );
    }

    // Update trip
    await trip.update(tripData);

    // Update tags
    if (tags) {
      await TripTag.destroy({ where: { trip_id: id } });
      await TripTag.bulkCreate(tags.map((tag) => ({ trip_id: id, tag })));
    }

    // Update places
    if (places) {
      await TripPlace.destroy({ where: { trip_id: id } });
      await TripPlace.bulkCreate(
        places.map((place) => ({ trip_id: id, ...place }))
      );
    }

    // Update cities (trip_cities)
    if (cities) {
      // delete existing
      await Trip.sequelize.query("DELETE FROM trip_cities WHERE trip_id = ?", {
        replacements: [id],
      });
      // Extract city UUIDs from objects (cities must be [{id: uuid}] format)
      const cityIds = cities.map((c) => c.id).filter(Boolean);
      for (let i = 0; i < cityIds.length; i++) {
        const cityId = cityIds[i];
        await Trip.sequelize.query(
          "INSERT INTO trip_cities (id, trip_id, city_id, city_order, created_at) VALUES (?, ?, ?, ?, NOW())",
          { replacements: [uuidv4(), id, cityId, i] }
        );
      }
      // no destination_city_id updates required; trip_cities holds the canonical cities
    }

    // Update itinerary
    if (itinerary) {
      await TripItineraryDay.destroy({ where: { trip_id: id } });

      for (const day of itinerary) {
        const itineraryDay = await TripItineraryDay.create({
          trip_id: id,
          day_number: day.day,
          title: day.title,
        });

        if (day.activities && day.activities.length > 0) {
          await TripItineraryActivity.bulkCreate(
            day.activities.map((activity, index) => ({
              itinerary_day_id: itineraryDay.id,
              ...activity,
              activity_order: index,
            }))
          );
        }
      }
    }

    // Update trip images
    if (trip_images !== undefined) {
      await TripImage.destroy({ where: { trip_id: id } });
      if (Array.isArray(trip_images) && trip_images.length > 0) {
        await TripImage.bulkCreate(
          trip_images.map((img, index) => ({
            trip_id: id,
            place_photo_id: img.place_photo_id || null,
            city_photo_id: img.city_photo_id || null,
            is_cover: img.is_cover || false,
            image_order:
              img.image_order !== undefined ? img.image_order : index,
          }))
        );
      }
    }

    // Fetch updated trip
    const updatedTrip = await Trip.findByPk(id, {
      include: [
        { model: User, as: "author" },
        { model: TripTag, as: "tags" },
        {
          model: TripPlace,
          as: "places",
          include: [
            {
              model: Place,
              as: "place",
              attributes: [
                "id",
                "latitude",
                "longitude",
                "rating",
                "user_ratings_total",
                "google_place_id",
              ],
            },
          ],
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
              include: [
                {
                  model: Place,
                  as: "place",
                  attributes: [
                    "id",
                    "latitude",
                    "longitude",
                    "rating",
                    "user_ratings_total",
                    "google_place_id",
                    "name",
                    "address",
                    "price_level",
                  ],
                  include: [
                    {
                      model: PlacePhoto,
                      as: "photos",
                      attributes: [
                        "url_small",
                        "url_medium",
                        "url_large",
                        "photo_order",
                      ],
                      order: [["photo_order", "ASC"]],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    res.json(buildSuccessResponse(await formatTripResponse(updatedTrip)));
  } catch (error) {
    next(error);
  }
};

const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const trip = await Trip.findByPk(id);

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    if (trip.author_id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to delete this trip"
          )
        );
    }

    await trip.destroy();

    res.json(buildSuccessResponse({ message: "Trip deleted successfully" }));
  } catch (error) {
    next(error);
  }
};

// Helper function to format trip response
async function formatTripResponse(trip) {
  const tripData = trip.toJSON();

  // Count steals from trip_steals table
  const derivationsCount = await TripSteal.count({
    where: { original_trip_id: tripData.id },
  });

  // Collect all images: trip_images + city photos + place photos
  const images = [];

  // Add trip images first (ordered by image_order)
  if (tripData.images && tripData.images.length > 0) {
    tripData.images.forEach((tripImage) => {
      if (tripImage.placePhoto?.url_medium) {
        images.push(getFullImageUrl(tripImage.placePhoto.url_medium));
      } else if (tripImage.cityPhoto?.url_medium) {
        images.push(getFullImageUrl(tripImage.cityPhoto.url_medium));
      }
    });
  }

  // Add photos from cities (if present)
  if (tripData.cities && tripData.cities.length > 0) {
    tripData.cities.forEach((city) => {
      if (city.photos) {
        city.photos.forEach((photo) => {
          if (photo.url_medium) images.push(getFullImageUrl(photo.url_medium));
        });
      }
    });
  }

  // Add place photos from itinerary days and activities
  if (tripData.itineraryDays) {
    const addedPlaceIds = new Set();
    tripData.itineraryDays.forEach((day) => {
      if (day.activities) {
        day.activities.forEach((activity) => {
          if (activity.place?.photos && !addedPlaceIds.has(activity.place.id)) {
            addedPlaceIds.add(activity.place.id);
            activity.place.photos.forEach((photo) => {
              if (photo.url_medium) {
                images.push(getFullImageUrl(photo.url_medium));
              }
            });
          }
        });
      }
    });
  }

  const durationDays = tripData.itineraryDays
    ? tripData.itineraryDays.length
    : 0;

  // Extract cities with IDs
  const cityMap = new Map();
  // If trip has explicit cities relation (new many-to-many) use it
  let citiesWithIds = [];
  let destinationObj = null;
  if (tripData.cities && tripData.cities.length > 0) {
    // tripData.cities is an array of City models with through.city_order
    citiesWithIds = tripData.cities
      .map((c) => ({
        id: c.id,
        name: c.name,
        // Return a nested country object when available to keep responses consistent
        country: c.country
          ? { id: c.country.id, name: c.country.name, code: c.country.code }
          : null,
        order:
          c.trip_cities?.city_order ||
          c.Cities?.city_order ||
          (c.CityTrip?.city_order ?? 0),
      }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    // destination is first city by order
    destinationObj = { id: citiesWithIds[0].id, name: citiesWithIds[0].name };
  } else {
    // fallback to previous behavior (destination string & itinerary parsing)
    const fallbackCityMap = new Map();
    const destination = tripData.destination || "";
    const destCityName = destination.split(",")[0].trim();
    if (destCityName) {
      fallbackCityMap.set(destCityName.toLowerCase(), {
        name: destination,
        id: null,
      });
    }
    if (tripData.itineraryDays) {
      tripData.itineraryDays.forEach((day) => {
        if (day.activities) {
          day.activities.forEach((activity) => {
            const location = activity.location || activity.place?.address || "";
            const parts = location.split(",");
            if (parts.length > 0) {
              const cityName = parts[0].trim();
              if (cityName) {
                fallbackCityMap.set(cityName.toLowerCase(), {
                  name: location,
                  id: null,
                });
              }
            }
          });
        }
      });
    }
    const cityNames = Array.from(fallbackCityMap.keys());
    if (cityNames.length > 0) {
      const cities = await City.findAll({
        where: {
          name: {
            [Op.in]: cityNames.map(
              (name) => name.charAt(0).toUpperCase() + name.slice(1)
            ),
          },
        },
        attributes: ["id", "name"],
        // Include country id/name/code so we can build a nested object in the response
        include: [
          { model: Country, as: "country", attributes: ["id", "name", "code"] },
        ],
      });
      cities.forEach((cityObj) => {
        const key = cityObj.name.toLowerCase();
        if (fallbackCityMap.has(key)) {
          const fullName = `${cityObj.name}, ${cityObj.country?.name || ""}`;
          fallbackCityMap.set(key, {
            name: fullName,
            id: cityObj.id,
            country: cityObj.country
              ? {
                  id: cityObj.country.id,
                  name: cityObj.country.name,
                  code: cityObj.country.code,
                }
              : null,
          });
        }
      });
    }
    citiesWithIds = Array.from(fallbackCityMap.values());
    // Prefer first city in citiesWithIds as the destination
    if (citiesWithIds.length > 0) {
      destinationObj = {
        id: citiesWithIds[0].id || null,
        name: citiesWithIds[0].name,
      };
    } else if (destination) {
      // Legacy fallback to the destination string when cities are not available
      destinationObj = { name: destination };
    }
  }

  return {
    id: tripData.id,
    title: tripData.title,
    description: tripData.description,
    duration: tripData.duration,
    duration_days: durationDays,
    budget: tripData.budget,
    transportation: tripData.transportation,
    accommodation: tripData.accommodation,
    best_time_to_visit: tripData.best_time_to_visit,
    difficulty_level: tripData.difficulty_level,
    trip_type: tripData.trip_type,
    images: images,
    trip_images: tripData.images
      ? tripData.images.map((img) => ({
          id: img.id,
          place_photo_id: img.place_photo_id,
          city_photo_id: img.city_photo_id,
          is_cover: img.is_cover,
          image_order: img.image_order,
          placePhoto: img.placePhoto
            ? {
                url_small: getFullImageUrl(img.placePhoto.url_small),
                url_medium: getFullImageUrl(img.placePhoto.url_medium),
                url_large: getFullImageUrl(img.placePhoto.url_large),
              }
            : null,
          cityPhoto: img.cityPhoto
            ? {
                url_small: getFullImageUrl(img.cityPhoto.url_small),
                url_medium: getFullImageUrl(img.cityPhoto.url_medium),
                url_large: getFullImageUrl(img.cityPhoto.url_large),
              }
            : null,
        }))
      : [],
    destination_lat: tripData.destination_lat,
    destination_lng: tripData.destination_lng,
    is_public: tripData.is_public,
    is_featured: tripData.is_featured,
    likes: tripData.likes_count,
    views: tripData.views_count,
    steals: derivationsCount,
    created_at: tripData.created_at,
    updated_at: tripData.updated_at,
    currentUserLiked: tripData.currentUserLiked || false,
    currentUserFollowing: tripData.currentUserFollowing || false,
    author: tripData.author
      ? {
          id: tripData.author.id,
          full_name: tripData.author.full_name,
          preferred_name: tripData.author.preferred_name,
          photo_url: getFullImageUrl(tripData.author.photo_url),
          email: tripData.author.email,
          bio: tripData.author.bio,
        }
      : null,
    tags: tripData.tags ? tripData.tags.map((t) => t.tag) : [],
    // Return raw cities array; frontend should format names/locations for display
    cities: citiesWithIds,
    places: tripData.places
      ? tripData.places.map((p) => ({
          id: p.id,
          name: p.name,
          address: p.address,
          rating: p.rating ? parseFloat(p.rating) : null,
          price_level: p.price_level,
          types: p.types,
          description: p.description,
          created_at: p.created_at,
          place: p.place
            ? {
                id: p.place.id,
                latitude: p.place.latitude,
                longitude: p.place.longitude,
                rating: p.place.rating ? parseFloat(p.place.rating) : null,
                user_ratings_total: p.place.user_ratings_total,
                google_place_id: p.place.google_place_id,
                city_id: p.place.city_id,
                photos: p.place.photos
                  ? p.place.photos.map((photo) => ({
                      url_small: getFullImageUrl(photo.url_small),
                      url_medium: getFullImageUrl(photo.url_medium),
                      url_large: getFullImageUrl(photo.url_large),
                      photo_order: photo.photo_order,
                    }))
                  : [],
              }
            : null,
        }))
      : [],
    itinerary: tripData.itineraryDays
      ? tripData.itineraryDays.map((day) => ({
          day: day.day_number,
          title: day.title,
          description: day.description,
          places: day.activities
            ? day.activities
                .filter((a) => a.place)
                .map((a) => ({
                  id: a.place.id,
                  place_id: a.place.google_place_id,
                  name: a.place.name,
                  address: a.place.address,
                  rating: a.place.rating ? parseFloat(a.place.rating) : null,
                  price_level: a.place.price_level,
                  types: a.place.types || [],
                  description: a.description || "",
                  photo: a.place.photos?.[0]
                    ? getFullImageUrl(a.place.photos[0].url_medium)
                    : null,
                  photos: a.place.photos
                    ? a.place.photos.map((p) => ({
                        url_small: getFullImageUrl(p.url_small),
                        url_medium: getFullImageUrl(p.url_medium),
                        url_large: getFullImageUrl(p.url_large),
                      }))
                    : [],
                }))
            : [],
          activities: day.activities
            ? day.activities.map((a) => ({
                time: a.time,
                name: a.name,
                latitude: a.latitude,
                longitude: a.longitude,
                location: a.location,
                description: a.description,
                activity_order: a.activity_order,
                place_id: a.place_id,
                place: a.place
                  ? {
                      id: a.place.id,
                      google_place_id: a.place.google_place_id,
                      name: a.place.name,
                      address: a.place.address,
                      latitude: a.place.latitude,
                      longitude: a.place.longitude,
                      rating: a.place.rating
                        ? parseFloat(a.place.rating)
                        : null,
                      user_ratings_total: a.place.user_ratings_total,
                      price_level: a.place.price_level,
                      city: a.place.city
                        ? {
                            id: a.place.city.id,
                            name: a.place.city.name,
                            country: a.place.city.country
                              ? {
                                  id: a.place.city.country.id,
                                  name: a.place.city.country.name,
                                }
                              : null,
                          }
                        : null,
                    }
                  : null,
              }))
            : [],
        }))
      : [],
    comments: tripData.comments
      ? tripData.comments.map((c) => ({
          id: c.id,
          comment: c.comment,
          created_at: c.created_at,
          commenter: c.commenter
            ? {
                id: c.commenter.id,
                name: c.commenter.preferred_name || c.commenter.full_name,
                photo: c.commenter.photo_url,
              }
            : null,
        }))
      : [],
  };
}

const getTripLikes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const { count, rows: likes } = await TripLike.findAndCountAll({
      where: { trip_id: id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "displayName", "avatar"],
        },
      ],
      limit: limitNum,
      offset,
      order: [["created_at", "DESC"]],
    });

    const pagination = buildPaginationMeta(pageNum, limitNum, count);
    res.json(buildSuccessResponse(likes, pagination));
  } catch (error) {
    next(error);
  }
};

const getTripReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    // Reviews will need their own Sequelize model, for now return empty array
    const reviews = [];
    const total = 0;
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(reviews, pagination));
  } catch (error) {
    next(error);
  }
};

const getTripDerivations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const { count, rows: steals } = await TripSteal.findAndCountAll({
      where: { original_trip_id: id },
      include: [
        {
          model: Trip,
          as: "newTrip",
          attributes: ["id", "title"],
          include: [
            {
              model: TripImage,
              as: "images",
              attributes: ["id", "place_photo_id", "city_photo_id", "is_cover"],
              include: [
                {
                  model: PlacePhoto,
                  as: "placePhoto",
                  attributes: ["url_small", "url_medium", "url_large"],
                },
                {
                  model: CityPhoto,
                  as: "cityPhoto",
                  attributes: ["url_small", "url_medium", "url_large"],
                },
              ],
              where: { is_cover: true },
              required: false,
              limit: 1,
            },
          ],
        },
        {
          model: User,
          as: "newUser",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
      limit: limitNum,
      offset,
      order: [["created_at", "DESC"]],
    });

    const formattedSteals = steals.map((steal) => {
      let coverImageUrl = null;
      if (steal.newTrip?.images && steal.newTrip.images.length > 0) {
        const coverImage = steal.newTrip.images[0];
        if (coverImage.placePhoto?.url_medium) {
          coverImageUrl = getFullImageUrl(coverImage.placePhoto.url_medium);
        } else if (coverImage.cityPhoto?.url_medium) {
          coverImageUrl = getFullImageUrl(coverImage.cityPhoto.url_medium);
        }
      }

      return {
        id: steal.id,
        original_trip_id: steal.original_trip_id,
        new_trip_id: steal.new_trip_id,
        new_trip_title: steal.newTrip?.title,
        new_trip_cover: coverImageUrl,
        stolen_by: steal.newUser?.id,
        stolen_by_name:
          steal.newUser?.preferred_name || steal.newUser?.full_name,
        stolen_by_photo: steal.newUser?.photo_url,
        created_at: steal.created_at,
      };
    });

    const pagination = buildPaginationMeta(pageNum, limitNum, count);
    res.json(buildSuccessResponse(formattedSteals, pagination));
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI review for a trip (returns first AI review if exists)
 * GET /v1/trips/:tripId/reviews/ai
 */
const getTripAiReview = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      return res
        .status(400)
        .json(buildErrorResponse("INVALID_INPUT", "tripId is required"));
    }

    // Find the AI review for this trip
    const aiReview = await TripReview.findOne({
      where: {
        trip_id: tripId,
        is_ai_generated: true,
      },
      attributes: ["id", "trip_id", "rating", "comment", "created_at"],
    });

    if (!aiReview) {
      return res
        .status(404)
        .json(
          buildErrorResponse("NOT_FOUND", "No AI review found for this trip")
        );
    }

    // Return AI review inside `data` so clients can access `response.data.aiReview`
    return res.json(
      buildSuccessResponse({
        aiReview: {
          id: aiReview.id,
          trip_id: aiReview.trip_id,
          rating: aiReview.rating,
          text: aiReview.comment,
          created_at: aiReview.created_at,
        },
      })
    );
  } catch (error) {
    console.error("[Get Trip AI Review] Error:", error);
    next(error);
  }
};

// POST /trips/:id/places - Add place to trip
const addPlaceToTrip = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;
    const userId = req.user.id;
    const { name, address, rating, price_level, types, place_id } = req.body;

    // Verify trip ownership
    const trip = await Trip.findOne({
      where: { id: tripId, author_id: userId },
    });

    if (!trip) {
      return res
        .status(404)
        .json(
          buildErrorResponse("NOT_FOUND", "Trip not found or unauthorized")
        );
    }

    // Check if place already exists in trip
    const existingPlace = await TripPlace.findOne({
      where: {
        trip_id: tripId,
        name: name,
      },
    });

    if (existingPlace) {
      // Return existing place instead of error
      return res.status(200).json(buildSuccessResponse({ place: existingPlace }));
    }

    // Resolve place record from provided `place_id` which can be either a Google Place ID (string)
    // or a Place UUID (existing Place.id). If Google Place ID not present in DB, create a new Place record.
    let placeRecord = null;

    if (place_id && place_id !== "MANUAL_ENTRY_REQUIRED") {
      const isUuid = typeof place_id === "string" && /^[0-9a-fA-F\-]{36}$/.test(place_id);
      if (isUuid) {
        // Provided a Place.id
        placeRecord = await Place.findByPk(place_id);
      } else {
        // Provided a Google Place ID
        placeRecord = await Place.findOne({ where: { google_place_id: place_id } });
        if (!placeRecord) {
          // If the place isn't cached yet, create a minimal Place record so we can reference it
          try {
            placeRecord = await Place.create({
              google_place_id: place_id,
              name: name || null,
              address: address || null,
              rating: rating || null,
              price_level: price_level || null,
              types: types || null,
              visible: true,
            });
          } catch (err) {
            // If creation fails (unique constraint), attempt to find again
            placeRecord = await Place.findOne({ where: { google_place_id: place_id } });
          }
        }
      }
    }

    // Create TripPlace entry
    const tripPlace = await TripPlace.create({
      trip_id: tripId,
      name,
      address,
      rating,
      price_level,
      types: types ? JSON.stringify(types) : null,
      place_id: placeRecord?.id || null,
    });

    // Return created place inside `data` for consistent client consumption
    return res.status(201).json(buildSuccessResponse({ place: tripPlace }));
  } catch (error) {
    next(error);
  }
};

// POST /trips/:id/cities - Add city to trip
const addCityToTrip = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;
    const userId = req.user.id;
    const { city_name, city_id } = req.body;

    // Verify trip ownership
    const trip = await Trip.findOne({
      where: { id: tripId, author_id: userId },
    });

    if (!trip) {
      return res
        .status(404)
        .json(
          buildErrorResponse("NOT_FOUND", "Trip not found or unauthorized")
        );
    }

    let cityRecord = null;

    if (city_id) {
      cityRecord = await City.findByPk(city_id);
    } else if (city_name) {
      // Support flexible city name formats like "City" or "City, Country".
      const normalized = String(city_name).trim();
      const parts = normalized
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const cityPart = parts[0];
      const countryPart = parts.length > 1 ? parts[parts.length - 1] : null;

      // Try several strategies to find the city in the DB in order of precision
      // 1) Exact match on name + country
      // 2) Case-insensitive contains match on name + country
      // 3) Exact match on name only
      // 4) Contains match on name only
      const buildCountryWhere = (country) =>
        country ? { name: { [Op.like]: `%${country}%` } } : null;

      // Helper to attempt find with optional country filter
      const tryFind = async (nameMatch, countryMatch) => {
        const include = [];
        if (countryMatch) {
          include.push({
            model: Country,
            as: "country",
            where: buildCountryWhere(countryMatch),
          });
        } else {
          include.push({ model: Country, as: "country" });
        }

        return City.findOne({
          where: nameMatch,
          include,
        });
      };

      // 1. Exact name + country (if country provided)
      if (countryPart) {
        cityRecord = await tryFind({ name: cityPart }, countryPart);
      }

      // 2. Case-insensitive contains match on name + country
      if (!cityRecord && countryPart) {
        cityRecord = await tryFind(
          { name: { [Op.like]: `%${cityPart}%` } },
          countryPart
        );
      }

      // 3. Exact name only
      if (!cityRecord) {
        cityRecord = await City.findOne({
          where: { name: cityPart },
          include: [{ model: Country, as: "country" }],
        });
      }

      // 4. Contains name only
      if (!cityRecord) {
        cityRecord = await City.findOne({
          where: { name: { [Op.like]: `%${cityPart}%` } },
          include: [{ model: Country, as: "country" }],
        });
      }

      if (!cityRecord) {
        return res
          .status(404)
          .json(
            buildErrorResponse(
              "NOT_FOUND",
              `City "${city_name}" not found in database`
            )
          );
      }
    }

    if (!cityRecord) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "VALIDATION_ERROR",
            "city_id or city_name required"
          )
        );
    }

    // Check for existing association using Sequelize association methods
    const hasCityAlready = await trip.hasCity(cityRecord.id);

    if (hasCityAlready) {
      // City already exists - return success with existing city
      const cityName = cityRecord.country
        ? `${cityRecord.name}, ${cityRecord.country.name}`
        : cityRecord.name;
      return res.status(200).json(
        buildSuccessResponse({
          city: {
            id: cityRecord.id,
            name: cityName,
          },
        })
      );
    }

    // Get all existing cities to compute next city_order
    const existingCities = await trip.getCities({
      attributes: [],
      joinTableAttributes: ["city_order"],
    });

    const nextOrder = existingCities.length > 0
      ? Math.max(...existingCities.map(c => c.trip_cities?.city_order || 0)) + 1
      : 0;

    // Add city to trip using Sequelize association method
    await trip.addCity(cityRecord.id, {
      through: { city_order: nextOrder },
    });

    // Return created city inside `data` for consistent client consumption
    return res.status(201).json(buildSuccessResponse({ city: cityRecord }));
  } catch (error) {
    next(error);
  }
};

// PUT /trips/:id/itinerary - Save organized itinerary
const saveItinerary = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;
    const userId = req.user.id;
    const { itinerary } = req.body;

    // Verify trip ownership
    const trip = await Trip.findOne({
      where: { id: tripId, author_id: userId },
    });

    if (!trip) {
      return res
        .status(404)
        .json(
          buildErrorResponse("NOT_FOUND", "Trip not found or unauthorized")
        );
    }

    // Delete existing itinerary
    await TripItineraryDay.destroy({
      where: { trip_id: tripId },
    });

    // Create new itinerary days and activities
    for (const day of itinerary) {
      const dayRecord = await TripItineraryDay.create({
        trip_id: tripId,
        day_number: day.day_number,
        title: day.title,
        description: day.description,
      });

      // Create activities for this day
      if (day.activities && day.activities.length > 0) {
        for (let i = 0; i < day.activities.length; i++) {
          const activity = day.activities[i];

          // Find place_id if google_place_id provided
          let placeId = null;
          if (activity.google_place_id) {
            const place = await Place.findOne({
              where: { google_place_id: activity.google_place_id },
            });
            placeId = place?.id || null;
          }

          await TripItineraryActivity.create({
            itinerary_day_id: dayRecord.id,
            time: activity.time,
            name: activity.name,
            location: activity.location,
            description: activity.description,
            activity_order: i,
            place_id: placeId,
          });
        }
      }
    }

    // Reload trip with itinerary
    const updatedTrip = await Trip.findByPk(tripId, {
      include: [
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [{ model: TripItineraryActivity, as: "activities" }],
        },
      ],
    });

    // Return updated trip inside `data` so clients can access `response.data.trip`
    return res.json(buildSuccessResponse({ trip: updatedTrip }));
  } catch (error) {
    next(error);
  }
};

// POST /trips/draft - Create draft trip
const createDraftTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title = "Untitled Trip" } = req.body;

    const trip = await Trip.create({
      id: uuidv4(),
      title,
      author_id: userId,
      is_draft: true,
      is_public: false,
    });

    // Return the created trip inside `data` so clients get `{ trip }` as expected
    return res.status(201).json(buildSuccessResponse({ trip }));
  } catch (error) {
    next(error);
  }
};

// GET /trips/draft/current - Find user's first draft (oldest by created_at)
const getCurrentDraftTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const trip = await Trip.findOne({
      where: {
        author_id: userId,
        is_draft: true,
      },
      order: [["created_at", "ASC"]],
      include: [
        { model: City, as: "cities" },
        { model: TripPlace, as: "places" },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [{ model: TripItineraryActivity, as: "activities" }],
        },
      ],
    });

    // Return the draft trip inside `data` so clients receive `{ trip }` reliably
    return res.json(buildSuccessResponse({ trip }));
  } catch (error) {
    next(error);
  }
};

// PATCH /trips/:id/finalize - Publish draft trip
const finalizeTripDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, is_public = true } = req.body;

    // Find trip and verify ownership
    const trip = await Trip.findOne({
      where: { id, author_id: userId },
      include: [
        { model: TripPlace, as: "places" },
        { model: City, as: "cities" },
      ],
    });

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("NOT_FOUND", "Trip not found"));
    }

    // Validation
    if (!title || title.trim().length === 0) {
      return res
        .status(400)
        .json(buildErrorResponse("VALIDATION_ERROR", "Title is required"));
    }

    if (!trip.places || trip.places.length === 0) {
      if (!trip.cities || trip.cities.length === 0) {
        return res
          .status(400)
          .json(
            buildErrorResponse(
              "VALIDATION_ERROR",
              "Trip must have at least one place or city before publishing"
            )
          );
      }
    }

    // Update trip
    await trip.update({
      title,
      description,
      is_public,
      is_draft: false,
    });

    // Reload with full data
    const updatedTrip = await Trip.findByPk(id, {
      include: [
        { model: User, as: "author" },
        { model: City, as: "cities" },
        { model: TripPlace, as: "places" },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [{ model: TripItineraryActivity, as: "activities" }],
        },
      ],
    });

    // Return updated trip inside `data` so clients can access `response.data.trip`
    return res.json(buildSuccessResponse({ trip: updatedTrip }));
  } catch (error) {
    next(error);
  }
};

// DELETE /trips/:id/places/:placeId - Remove place from trip
const removePlaceFromTrip = async (req, res, next) => {
  try {
    const { id: tripId, placeId } = req.params;
    const userId = req.user.id;

    // Verify trip ownership
    const trip = await Trip.findOne({
      where: { id: tripId, author_id: userId },
    });

    if (!trip) {
      return res
        .status(404)
        .json(
          buildErrorResponse("NOT_FOUND", "Trip not found or unauthorized")
        );
    }

    // Find and delete the place
    const place = await TripPlace.findOne({
      where: { id: placeId, trip_id: tripId },
    });

    if (!place) {
      return res
        .status(404)
        .json(buildErrorResponse("NOT_FOUND", "Place not found in trip"));
    }

    await place.destroy();

    return res.json(
      buildSuccessResponse({ message: "Place removed successfully" })
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /trips/:id/cities/:cityId - Remove city from trip
const removeCityFromTrip = async (req, res, next) => {
  try {
    const { id: tripId, cityId } = req.params;
    const userId = req.user.id;

    // Verify trip ownership
    const trip = await Trip.findOne({
      where: { id: tripId, author_id: userId },
    });

    if (!trip) {
      return res
        .status(404)
        .json(
          buildErrorResponse("NOT_FOUND", "Trip not found or unauthorized")
        );
    }

    // Check if city association exists using Sequelize association methods
    const hasCityAssociation = await trip.hasCity(cityId);

    if (!hasCityAssociation) {
      return res
        .status(404)
        .json(buildErrorResponse("NOT_FOUND", "City not found in trip"));
    }

    // Remove city association using Sequelize association method
    await trip.removeCity(cityId);

    return res.json(
      buildSuccessResponse({ message: "City removed successfully" })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Publish trip with selected photos
 * POST /trips/:id/publish
 */
const publishTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { photos, title, description } = req.body;
    const userId = req.user.id;

    // Verify trip exists and user is the author
    const trip = await Trip.findOne({
      where: { id, author_id: userId },
    });

    if (!trip) {
      return res
        .status(404)
        .json(
          buildErrorResponse(
            "NOT_FOUND",
            "Trip not found or you don't have permission to publish it"
          )
        );
    }

    // If no photos provided, auto-select random photos from cities/places
    if (!photos || photos.length === 0) {
      // Get trip with cities and places
      const tripWithData = await Trip.findByPk(id, {
        include: [
          {
            model: City,
            as: "cities",
            attributes: ["id"],
            through: { attributes: [] },
            include: [
              {
                model: CityPhoto,
                as: "photos",
                attributes: ["id"],
                limit: 5,
              },
            ],
          },
          {
            model: TripPlace,
            as: "places",
            attributes: ["place_id"],
            include: [
              {
                model: Place,
                as: "place",
                attributes: ["id"],
                include: [
                  {
                    model: PlacePhoto,
                    as: "photos",
                    attributes: ["id"],
                    limit: 5,
                  },
                ],
              },
            ],
          },
        ],
      });

      const cityPhotos = [];
      const placePhotos = [];

      // Extract city photos
      if (tripWithData.cities) {
        tripWithData.cities.forEach((city) => {
          if (city.photos) {
            city.photos.forEach((photo) => {
              cityPhotos.push({ id: photo.id, type: "city" });
            });
          }
        });
      }

      // Extract place photos
      if (tripWithData.places) {
        tripWithData.places.forEach((tripPlace) => {
          if (tripPlace.place && tripPlace.place.photos) {
            tripPlace.place.photos.forEach((photo) => {
              placePhotos.push({ id: photo.id, type: "place" });
            });
          }
        });
      }

      // Shuffle and combine photos
      const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const shuffledCityPhotos = shuffleArray(cityPhotos).slice(0, 5);
      const shuffledPlacePhotos = shuffleArray(placePhotos).slice(0, 5);
      const autoPhotos = [...shuffledCityPhotos, ...shuffledPlacePhotos].slice(
        0,
        10
      );

      // Convert to photos array format
      photos = autoPhotos.map((photo, index) => ({
        place_photo_id: photo.type === "place" ? photo.id : null,
        city_photo_id: photo.type === "city" ? photo.id : null,
        image_order: index,
        is_cover: index === 0,
      }));
    }

    // Update trip details
    const updateData = { is_public: true, is_draft: false };
    if (title !== undefined) {
      updateData.title = title;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    await trip.update(updateData);

    // Delete existing trip images
    await TripImage.destroy({ where: { trip_id: id } });

    // Create new trip images (only if we have photos)
    if (photos && photos.length > 0) {
      const tripImages = photos.map((photo) => ({
        trip_id: id,
        place_photo_id: photo.place_photo_id || null,
        city_photo_id: photo.city_photo_id || null,
        image_order: photo.image_order,
        is_cover: photo.is_cover,
      }));

      await TripImage.bulkCreate(tripImages);
    }

    // Fetch trip with images to return
    const updatedTrip = await Trip.findByPk(id, {
      include: [
        {
          model: TripImage,
          as: "images",
          include: [
            {
              model: PlacePhoto,
              as: "placePhoto",
            },
            {
              model: CityPhoto,
              as: "cityPhoto",
            },
          ],
        },
      ],
    });

    return res.json(
      buildSuccessResponse({
        message: "Trip published successfully",
        trip: updatedTrip,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripLikes,
  getTripReviews,
  getTripDerivations,
  getTripAiReview,
  addPlaceToTrip,
  addCityToTrip,
  removePlaceFromTrip,
  removeCityFromTrip,
  saveItinerary,
  createDraftTrip,
  getCurrentDraftTrip,
  finalizeTripDraft,
  publishTrip,
};
