const express = require("express");
const { body } = require("express-validator");
const placeFavoriteController = require("../controllers/placeFavoriteController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validator");

const router = express.Router();

// Get user's favorite places
router.get("/", authenticate, placeFavoriteController.getUserPlaceFavorites);

// Add place to favorites
router.post(
  "/",
  authenticate,
  [body("place_id").isInt()],
  validate,
  placeFavoriteController.createPlaceFavorite
);

// Remove place from favorites
router.delete("/:id", authenticate, placeFavoriteController.deletePlaceFavorite);

module.exports = router;
