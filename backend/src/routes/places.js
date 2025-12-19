const express = require("express");
const router = express.Router();
const {
  searchPlaces,
  getTripPlacesEnriched,
  getPlaceById,
  getAiReview,
} = require("../controllers/placeController");

// Public routes
router.get("/search", searchPlaces);
router.get("/ai-review/:placeId", getAiReview);
router.get("/:id", getPlaceById);

module.exports = router;
