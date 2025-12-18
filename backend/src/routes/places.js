const express = require("express");
const router = express.Router();
const {
  searchPlaces,
  getTripPlacesEnriched,
  getPlaceById,
} = require("../controllers/placeController");

// Public routes
router.get("/search", searchPlaces);
router.get("/:id", getPlaceById);

module.exports = router;
