const ReviewModel = require("../models/Review");
const TripModel = require("../models/Trip");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

const getReviews = async (req, res) => {
  try {
    const { tripId, placeId, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const reviews = await ReviewModel.findAll({
      tripId,
      placeId,
      offset,
      limit: limitNum,
    });

    const total = await ReviewModel.count({ tripId, placeId });
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(reviews, pagination));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch reviews")
      );
  }
};

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await ReviewModel.findById(id);

    if (!review) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Review not found"));
    }

    res.json(buildSuccessResponse(review));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch review")
      );
  }
};

const createReview = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { tripId, placeId, rating, comment } = req.body;

    if (tripId) {
      const trip = await TripModel.findById(tripId);
      if (!trip) {
        return res
          .status(404)
          .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
      }
    }

    const review = await ReviewModel.create({
      tripId,
      placeId,
      reviewerId,
      rating,
      comment,
    });

    res.status(201).json(buildSuccessResponse(review));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to create review")
      );
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await ReviewModel.findById(id);

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

    const updatedReview = await ReviewModel.update(id, req.body);

    res.json(buildSuccessResponse(updatedReview));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to update review")
      );
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await ReviewModel.findById(id);

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

    await ReviewModel.delete(id);

    res.json(buildSuccessResponse({ message: "Review deleted successfully" }));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to delete review")
      );
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
