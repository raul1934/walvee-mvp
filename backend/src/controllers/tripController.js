const TripModel = require("../models/Trip");
const TripLikeModel = require("../models/TripLike");
const ReviewModel = require("../models/Review");
const TripDerivationModel = require("../models/TripDerivation");
const UserModel = require("../models/User");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
} = require("../utils/helpers");

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

    const trips = await TripModel.findAll({
      offset,
      limit: limitNum,
      sortBy,
      order,
      destination,
      createdBy,
      isPublic,
      minLikes: minLikes ? parseInt(minLikes) : null,
      search,
    });

    const total = await TripModel.count({
      destination,
      createdBy,
      isPublic,
      minLikes: minLikes ? parseInt(minLikes) : null,
      search,
    });

    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(trips, pagination));
  } catch (error) {
    next(error);
  }
};

const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await TripModel.findById(id);

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    res.json(buildSuccessResponse(trip));
  } catch (error) {
    next(error);
  }
};

const createTrip = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "User not found"));
    }

    const tripData = {
      ...req.body,
      authorId: userId,
    };

    const trip = await TripModel.create(tripData);

    // Update user metrics
    await UserModel.updateMetrics(userId, { trips: user.metrics_trips + 1 });

    res.status(201).json(buildSuccessResponse(trip));
  } catch (error) {
    next(error);
  }
};

const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const trip = await TripModel.findById(id);

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    if (trip.author.id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to update this trip"
          )
        );
    }

    const updatedTrip = await TripModel.update(id, req.body);

    res.json(buildSuccessResponse(updatedTrip));
  } catch (error) {
    next(error);
  }
};

const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const trip = await TripModel.findById(id);

    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    if (trip.author.id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to delete this trip"
          )
        );
    }

    await TripModel.delete(id);

    // Update user metrics
    const user = await UserModel.findById(userId);
    await UserModel.updateMetrics(userId, {
      trips: Math.max(0, user.metrics_trips - 1),
    });

    res.json(buildSuccessResponse({ message: "Trip deleted successfully" }));
  } catch (error) {
    next(error);
  }
};

const getTripLikes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const likes = await TripLikeModel.findByTrip(id, offset, limitNum);
    const total = await TripLikeModel.countByTrip(id);
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

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

    const reviews = await ReviewModel.findAll({
      tripId: id,
      offset,
      limit: limitNum,
    });
    const total = await ReviewModel.count({ tripId: id });
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

    const derivations = await TripDerivationModel.findAll({
      originalTripId: id,
      offset,
      limit: limitNum,
    });

    const total = await TripDerivationModel.count({ originalTripId: id });
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(derivations, pagination));
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
};
