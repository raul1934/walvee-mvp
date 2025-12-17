const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validator");

const router = express.Router();

// Google OAuth
router.get("/google", authController.initiateGoogleAuth);
router.get("/google/callback", authController.googleCallback);

// Token management
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);

// Current user
router.get("/me", authenticate, authController.getCurrentUser);

module.exports = router;
