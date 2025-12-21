const {
  PlaceFavorite,
  Place,
  PlacePhoto,
  User,
} = require("../models/sequelize");
const {
  buildSuccessResponse,
  buildErrorResponse,
  getFullImageUrl,
} = require("../utils/helpers");

const createPlaceFavorite = async (req, res, next) => {
  try {
    const { place_id } = req.body;
    const user_id = req.user.id;

    if (!place_id) {
      return res
        .status(400)
        .json(buildErrorResponse("place_id is required", 400));
    }

    // Check if place exists
    const place = await Place.findByPk(place_id);
    if (!place) {
      return res.status(404).json(buildErrorResponse("Place not found", 404));
    }

    // Check if already favorited
    const existingFavorite = await PlaceFavorite.findOne({
      where: { place_id, user_id },
    });

    if (existingFavorite) {
      return res
        .status(409)
        .json(buildErrorResponse("Place already favorited", 409));
    }

    // Create favorite
    const favorite = await PlaceFavorite.create({
      place_id,
      user_id,
    });

    return res.status(201).json(
      buildSuccessResponse({
        favorite: {
          id: favorite.id,
          place_id: favorite.place_id,
          user_id: favorite.user_id,
          created_at: favorite.created_at,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

const deletePlaceFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const favorite = await PlaceFavorite.findOne({
      where: { id, user_id },
    });

    if (!favorite) {
      return res
        .status(404)
        .json(buildErrorResponse("Favorite not found", 404));
    }

    await favorite.destroy();

    return res
      .status(200)
      .json(buildSuccessResponse({ message: "Favorite removed successfully" }));
  } catch (error) {
    next(error);
  }
};

const getUserPlaceFavorites = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const favorites = await PlaceFavorite.findAll({
      where: { user_id },
      include: [
        {
          model: Place,
          as: "place",
          include: [
            {
              model: PlacePhoto,
              as: "photos",
              attributes: ["id", "url_small", "url_medium", "url_large"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const formattedFavorites = favorites.map((favorite) => {
      const place = favorite.place;
      return {
        id: favorite.id,
        place_id: favorite.place_id,
        user_id: favorite.user_id,
        created_at: favorite.created_at,
        place: {
          id: place.id,
          name: place.name,
          types: place.types || [],
          vicinity: place.vicinity,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          price_level: place.price_level,
          photo: place.photos?.[0]
            ? {
                url_small: getFullImageUrl(place.photos[0].url_small),
                url_medium: getFullImageUrl(place.photos[0].url_medium),
                url_large: getFullImageUrl(place.photos[0].url_large),
              }
            : null,
        },
      };
    });

    return res.status(200).json(buildSuccessResponse({ favorites: formattedFavorites }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlaceFavorite,
  deletePlaceFavorite,
  getUserPlaceFavorites,
};
