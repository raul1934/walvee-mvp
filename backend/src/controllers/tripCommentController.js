const { TripComment, Trip, User } = require("../models/sequelize");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

const getComments = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    // Check trip exists
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    const { count: total, rows: comments } = await TripComment.findAndCountAll({
      where: { trip_id: tripId },
      include: [
        {
          model: User,
          as: "commenter",
          attributes: ["id", "preferred_name", "full_name", "photo_url"],
        },
      ],
      offset,
      limit: limitNum,
      order: [["created_at", "DESC"]],
    });

    const pagination = buildPaginationMeta(pageNum, limitNum, total);
    res.json(buildSuccessResponse(comments, pagination));
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;
    const userId = req.user.id;
    const { comment } = req.body;

    if (!comment || String(comment).trim() === "") {
      return res
        .status(400)
        .json(
          buildErrorResponse("VALIDATION_ERROR", "Comment cannot be empty")
        );
    }

    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Trip not found"));
    }

    const newComment = await TripComment.create({
      trip_id: tripId,
      user_id: userId,
      comment: comment.trim(),
    });

    // Fetch with commenter info
    const created = await TripComment.findByPk(newComment.id, {
      include: [
        {
          model: User,
          as: "commenter",
          attributes: ["id", "preferred_name", "full_name", "photo_url"],
        },
      ],
    });

    res.status(201).json(buildSuccessResponse(created));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  createComment,
};
