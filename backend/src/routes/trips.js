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
    // `destination` removed in favor of `cities` relation
    body("description").optional().isString().trim().isLength({ max: 5000 }),
    body("durationDays").isInt({ min: 1 }),
    body("visibility").optional().isIn(["public", "private"]),
    body("imageUrl").optional().isString(),
    body("images").optional().isArray(),
    body("locations").optional().isArray(),
    body("cities").optional().isArray(),
    body("cities.*")
      .optional()
      .isObject()
      .custom((val) => {
        const isUuid = (v) =>
          typeof v === "string" && /^[0-9a-fA-F\-]{36}$/.test(v);
        if (!val.id || !isUuid(val.id)) {
          throw new Error(
            "each city must be an object with an `id` uuid property"
          );
        }
        return true;
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
    // `destination` removed in favor of `cities` relation
    body("description").optional().isString().trim().isLength({ max: 5000 }),
    body("durationDays").optional().isInt({ min: 1 }),
    body("visibility").optional().isIn(["public", "private"]),
    body("imageUrl").optional().isString(),
    body("images").optional().isArray(),
    body("locations").optional().isArray(),
    body("itinerary").optional().isArray(),
    body("cities").optional().isArray(),
    body("cities.*")
      .optional()
      .isObject()
      .custom((val) => {
        const isUuid = (v) =>
          typeof v === "string" && /^[0-9a-fA-F\-]{36}$/.test(v);
        if (!val.id || !isUuid(val.id)) {
          throw new Error(
            "each city must be an object with an `id` uuid property"
          );
        }
        return true;
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

// Draft trip endpoints
router.post("/draft", authenticate, tripController.createDraftTrip);
router.get("/draft/current", authenticate, tripController.getCurrentDraftTrip);
router.patch("/:id/finalize", authenticate, tripController.finalizeTripDraft);

// Add place to trip
router.post("/:id/places", authenticate, tripController.addPlaceToTrip);

// Remove place from trip
router.delete("/:id/places/:placeId", authenticate, tripController.removePlaceFromTrip);

// Add city to trip
router.post("/:id/cities", authenticate, tripController.addCityToTrip);

// Remove city from trip
router.delete("/:id/cities/:cityId", authenticate, tripController.removeCityFromTrip);

// Save itinerary
router.put("/:id/itinerary", authenticate, tripController.saveItinerary);

// Publish trip with photos
router.post(
  "/:id/publish",
  authenticate,
  [
    body("photos").optional().isArray(),
    body("photos.*.place_photo_id").optional().isUUID(),
    body("photos.*.city_photo_id").optional().isUUID(),
    body("photos.*.image_order").optional().isInt({ min: 0 }),
    body("photos.*.is_cover").optional().isBoolean(),
    body("title").optional().isString().trim().notEmpty().isLength({ max: 200 }),
    body("description").optional().isString().trim().isLength({ max: 5000 }),
  ],
  validate,
  tripController.publishTrip
);

module.exports = router;
