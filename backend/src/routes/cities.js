const express = require("express");
const router = express.Router();
const {
  searchCities,
  getOrCreateCity,
  getCityById,
  getCitiesByCountry,
  getCityAiReview,
} = require("../controllers/cityController");
const { authenticate } = require("../middleware/auth");

// Public routes
router.get("/search", searchCities);
router.get("/country", getCitiesByCountry);
router.get("/:cityId/reviews/ai", getCityAiReview);
router.get("/:id", getCityById);

// Protected routes (require authentication)
router.post("/", authenticate, getOrCreateCity);

module.exports = router;
