const express = require("express");
const router = express.Router();
const {
  searchPlaces,
  getTripPlacesEnriched,
  getPlaceById,
  getPlaceReviews,
} = require("../controllers/placeController");

// Public routes
router.get("/search", searchPlaces);
router.get("/:placeId/reviews", getPlaceReviews);
router.get("/:id", getPlaceById);

module.exports = router;
