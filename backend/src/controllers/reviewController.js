const {
  PlaceReview,
  TripReview,
  CityReview,
  Trip,
  User,
  City,
} = require("../models/sequelize");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

/**
 * Helper function to determine which review model to use
 */
function getReviewModel(tripId, placeId, cityId) {
  if (placeId) return PlaceReview;
  if (tripId) return TripReview;
  if (cityId) return CityReview;
  throw new Error("Must provide either tripId, placeId, or cityId");
}

/**
 * Helper function to build where clause based on review type
 */
function buildWhereClause(tripId, placeId, cityId) {
  if (placeId) return { place_id: placeId };
  if (tripId) return { trip_id: tripId };
  if (cityId) return { city_id: cityId };
  return {};
}

const getReviews = async (req, res, next) => {
  try {
    const { tripId, placeId, cityId, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const ReviewModel = getReviewModel(tripId, placeId, cityId);
    const where = buildWhereClause(tripId, placeId, cityId);

    const { count: total, rows: reviews } = await ReviewModel.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
      offset,
      limit: limitNum,
      order: [["created_at", "DESC"]],
    });
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(reviews, pagination));
  } catch (error) {
    next(error);
  }
};

const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try to find the review in all three tables
    let review = await PlaceReview.findByPk(id, {
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
    });

    if (!review) {
      review = await TripReview.findByPk(id, {
        include: [
          {
            model: User,
            as: "reviewer",
            attributes: ["id", "full_name", "preferred_name", "photo_url"],
          },
        ],
      });
    }

    if (!review) {
      review = await CityReview.findByPk(id, {
        include: [
          {
            model: User,
            as: "reviewer",
            attributes: ["id", "full_name", "preferred_name", "photo_url"],
          },
        ],
      });
    }

    if (!review) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Review not found"));
    }

    res.json(buildSuccessResponse(review));
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const reviewerId = req.user.id;
    const userEmail = req.user.email;
    const { tripId, placeId, cityId, rating, comment, priceOpinion } = req.body;

    // Validate that exactly one target is provided
    const targetCount = [tripId, placeId, cityId].filter(Boolean).length;
    if (targetCount === 0) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "INVALID_INPUT",
            "Must provide either tripId, placeId, or cityId"
          )
        );
    }
    if (targetCount > 1) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "INVALID_INPUT",
            "Can only review one target at a time"
          )
        );
    }

    // Validate the target exists
    if (tripId) {
      const trip = await Trip.findByPk(tripId);
      if (!trip) {
        return res
          .status(404)
          .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
      }
    } else if (cityId) {
      const city = await City.findByPk(cityId);
      if (!city) {
        return res
          .status(404)
          .json(buildErrorResponse("RESOURCE_NOT_FOUND", "City not found"));
      }
    }

    // Determine which model to use and create the review
    const ReviewModel = getReviewModel(tripId, placeId, cityId);
    const reviewData = {
      reviewer_id: reviewerId,
      created_by: userEmail,
      rating,
      comment,
      is_ai_generated: false,
    };

    if (placeId) {
      reviewData.place_id = placeId;
      if (priceOpinion) reviewData.price_opinion = priceOpinion;
    } else if (tripId) {
      reviewData.trip_id = tripId;
    } else if (cityId) {
      reviewData.city_id = cityId;
    }

    const review = await ReviewModel.create(reviewData);

    res.status(201).json(buildSuccessResponse(review));
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Try to find the review in all three tables
    let review = await PlaceReview.findByPk(id);
    let ReviewModel = PlaceReview;

    if (!review) {
      review = await TripReview.findByPk(id);
      ReviewModel = TripReview;
    }

    if (!review) {
      review = await CityReview.findByPk(id);
      ReviewModel = CityReview;
    }

    if (!review) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Review not found"));
    }

    if (review.reviewer_id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to update this review"
          )
        );
    }

    // Only allow updating certain fields
    const allowedFields = ["rating", "comment"];
    if (ReviewModel === PlaceReview) {
      allowedFields.push("price_opinion");
    }

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await review.update(updateData);

    const updatedReview = await ReviewModel.findByPk(id, {
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "full_name", "preferred_name", "photo_url"],
        },
      ],
    });

    res.json(buildSuccessResponse(updatedReview));
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Try to find the review in all three tables
    let review = await PlaceReview.findByPk(id);

    if (!review) {
      review = await TripReview.findByPk(id);
    }

    if (!review) {
      review = await CityReview.findByPk(id);
    }

    if (!review) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Review not found"));
    }

    if (review.reviewer_id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to delete this review"
          )
        );
    }

    await review.destroy();

    res.json(buildSuccessResponse({ message: "Review deleted successfully" }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
