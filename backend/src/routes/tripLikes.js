const express = require("express");
const { body } = require("express-validator");
const tripLikeController = require("../controllers/tripLikeController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validator");

const router = express.Router();

// Get user's favorite trips
router.get("/", authenticate, tripLikeController.getUserFavorites);

// Like a trip
router.post(
  "/",
  authenticate,
  [body("tripId").isUUID()],
  validate,
  tripLikeController.likeTrip
);

// Unlike a trip
router.delete("/:id", authenticate, tripLikeController.unlikeTrip);

// Check if user liked a trip
router.get("/check/:tripId", authenticate, tripLikeController.checkLikeStatus);

module.exports = router;
