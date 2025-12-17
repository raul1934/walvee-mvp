const TripDerivationModel = require("../models/TripDerivation");
const TripModel = require("../models/Trip");
const {
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

const getDerivations = async (req, res) => {
  try {
    const { originalTripId, creatorId, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = paginate(page, limit);

    const derivations = await TripDerivationModel.findAll({
      originalTripId,
      creatorId,
      offset,
      limit: limitNum,
    });

    const total = await TripDerivationModel.count({
      originalTripId,
      creatorId,
    });
    const pagination = buildPaginationMeta(pageNum, limitNum, total);

    res.json(buildSuccessResponse(derivations, pagination));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse(
          "INTERNAL_SERVER_ERROR",
          "Failed to fetch derivations"
        )
      );
  }
};

const createDerivation = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const { originalTripId, derivedTripId } = req.body;

    const originalTrip = await TripModel.findById(originalTripId);

    if (!originalTrip) {
      return res
        .status(404)
        .json(
          buildErrorResponse("RESOURCE_NOT_FOUND", "Original trip not found")
        );
    }

    if (originalTrip.created_by === creatorId) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "VALIDATION_ERROR",
            "You cannot steal your own trip"
          )
        );
    }

    if (derivedTripId) {
      const derivedTrip = await TripModel.findById(derivedTripId);
      if (!derivedTrip) {
        return res
          .status(404)
          .json(
            buildErrorResponse("RESOURCE_NOT_FOUND", "Derived trip not found")
          );
      }
    }

    const derivation = await TripDerivationModel.create(
      originalTripId,
      creatorId,
      derivedTripId
    );

    // Increment steals count on original trip
    await TripModel.incrementSteals(originalTripId);

    res.status(201).json(buildSuccessResponse(derivation));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse(
          "INTERNAL_SERVER_ERROR",
          "Failed to create derivation"
        )
      );
  }
};

const deleteDerivation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const derivation = await TripDerivationModel.findById(id);

    if (!derivation) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Derivation not found"));
    }

    if (derivation.creator_id !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to delete this derivation"
          )
        );
    }

    await TripDerivationModel.delete(id);

    res.json(
      buildSuccessResponse({ message: "Derivation deleted successfully" })
    );
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse(
          "INTERNAL_SERVER_ERROR",
          "Failed to delete derivation"
        )
      );
  }
};

module.exports = {
  getDerivations,
  createDerivation,
  deleteDerivation,
};
