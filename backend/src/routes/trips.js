const express = require("express");
const { body } = require("express-validator");
const tripController = require("../controllers/tripController");
const { authenticate, optionalAuth } = require("../middleware/auth");
const tripCommentController = require("../controllers/tripCommentController");
const placeController = require("../controllers/placeController");
const { validate } = require("../middleware/validator");

const router = express.Router();

// List trips
router.get("/", optionalAuth, tripController.getTrips);

// Create trip
router.post(
  "/",
  authenticate,
  [
    body("title").isString().trim().notEmpty().isLength({ max: 200 }),
    body("destination").isString().trim().notEmpty().isLength({ max: 255 }),
    body("description").optional().isString().trim().isLength({ max: 5000 }),
    body("durationDays").isInt({ min: 1 }),
    body("visibility").optional().isIn(["public", "private"]),
    body("imageUrl").optional().isURL(),
    body("images").optional().isArray(),
    body("locations").optional().isArray(),
    body("cities").optional().isArray(),
    body("cities.*")
      .optional()
      .custom((val) => {
        if (typeof val === "number") return true;
        if (typeof val === "object" && Number.isInteger(val.id)) return true;
        throw new Error(
          "each city must be an integer id or object with an `id` integer"
        );
      }),
    body("destinationLat").optional().isFloat(),
    body("destinationLng").optional().isFloat(),
    body("itinerary").isArray().notEmpty(),
  ],
  validate,
  tripController.createTrip
);

// Get trip by ID
router.get("/:id", optionalAuth, tripController.getTripById);

// Update trip
router.put(
  "/:id",
  authenticate,
  [
    body("title")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .isLength({ max: 200 }),
    body("destination")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .isLength({ max: 255 }),
    body("description").optional().isString().trim().isLength({ max: 5000 }),
    body("durationDays").optional().isInt({ min: 1 }),
    body("visibility").optional().isIn(["public", "private"]),
    body("imageUrl").optional().isURL(),
    body("images").optional().isArray(),
    body("locations").optional().isArray(),
    body("itinerary").optional().isArray(),
    body("cities").optional().isArray(),
    body("cities.*")
      .optional()
      .custom((val) => {
        if (typeof val === "number") return true;
        if (typeof val === "object" && Number.isInteger(val.id)) return true;
        throw new Error(
          "each city must be an integer id or object with an `id` integer"
        );
      }),
  ],
  validate,
  tripController.updateTrip
);

// Delete trip
router.delete("/:id", authenticate, tripController.deleteTrip);

// Get trip likes
router.get("/:id/likes", tripController.getTripLikes);

// Get trip reviews
router.get("/:id/reviews", tripController.getTripReviews);

// Get AI review for trip
router.get("/:tripId/reviews/ai", tripController.getTripAiReview);

// Trip comments
router.get("/:id/comments", tripCommentController.getComments);
router.post("/:id/comments", authenticate, tripCommentController.createComment);

// Get trip derivations
router.get("/:id/derivations", tripController.getTripDerivations);

// Get enriched places for trip (with cached Google Maps data)
router.get("/:id/places-enriched", placeController.getTripPlacesEnriched);

module.exports = router;
