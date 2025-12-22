const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validator");

const router = express.Router();

// List users
router.get("/", userController.getUsers);

// Get user by ID
router.get("/:id", userController.getUserById);

// Update current user
router.put(
  "/me",
  authenticate,
  [
    body("fullName").optional().isString().trim().notEmpty(),
    body("preferredName").optional().isString().trim(),
    body("bio").optional().isString().trim(),
    body("city").optional().isString().trim(),
    body("country").optional().isString().trim(),
    body("instagramUsername").optional().isString().trim(),
    body("photoUrl").optional().isURL(),
    body("onboardingCompleted").optional().isBoolean(),
  ],
  validate,
  userController.updateCurrentUser
);

// Get user's trips
router.get("/:id/trips", userController.getUserTrips);

// Get user stats
router.get("/:id/stats", userController.getUserStats);

// Complete onboarding
router.post(
  "/me/onboarding",
  authenticate,
  [
    body("city_id").optional().isUUID(),
    body("preferred_name").optional().isString().trim(),
    body("bio").optional().isString().trim(),
    body("instagram_username").optional().isString().trim(),
  ],
  validate,
  userController.completeOnboarding
);

module.exports = router;
