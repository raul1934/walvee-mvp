const express = require("express");
const { body } = require("express-validator");
const reviewController = require("../controllers/reviewController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validator");

const router = express.Router();

// List reviews
router.get("/", reviewController.getReviews);

// Create review
router.post(
  "/",
  authenticate,
  [
    body("tripId").optional().isUUID(),
    body("placeId").optional().isString(),
    body("rating").isInt({ min: 1, max: 5 }),
    body("comment").optional().isString().trim().isLength({ max: 5000 }),
  ],
  validate,
  reviewController.createReview
);

// Get review by ID
router.get("/:id", reviewController.getReviewById);

// Update review
router.put(
  "/:id",
  authenticate,
  [
    body("rating").optional().isInt({ min: 1, max: 5 }),
    body("comment").optional().isString().trim().isLength({ max: 5000 }),
  ],
  validate,
  reviewController.updateReview
);

// Delete review
router.delete("/:id", authenticate, reviewController.deleteReview);

module.exports = router;
