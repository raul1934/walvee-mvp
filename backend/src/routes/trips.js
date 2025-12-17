const express = require("express");
const { body } = require("express-validator");
const tripController = require("../controllers/tripControllerSequelize");
const { authenticate, optionalAuth } = require("../middleware/auth");
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

// Get trip derivations
router.get("/:id/derivations", tripController.getTripDerivations);

module.exports = router;
