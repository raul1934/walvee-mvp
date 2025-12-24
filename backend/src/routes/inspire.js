const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const inspireController = require("../controllers/inspirePromptController");

/**
 * @route POST /inspire/recommendations
 * @desc Get AI-powered place/city recommendations
 * @access Private
 */
router.post(
  "/recommendations",
  authenticate,
  inspireController.getRecommendations
);

/**
 * @route POST /inspire/organize
 * @desc Create structured itinerary from places
 * @access Private
 */
router.post("/organize", authenticate, inspireController.organizeItinerary);

/**
 * @route POST /inspire/call
 * @desc DEPRECATED - Handle inspire prompts via LLM (legacy endpoint)
 * @access Private
 * @deprecated Use /inspire/recommendations or /inspire/organize instead
 */
router.post("/call", authenticate, inspireController.call);

/**
 * @route POST /inspire/modify-trip
 * @desc Analyze user query and propose trip modifications
 * @access Private
 */
router.post("/modify-trip", authenticate, inspireController.modifyTrip);

/**
 * @route POST /inspire/apply-changes
 * @desc Apply approved changes to a trip
 * @access Private
 */
router.post("/apply-changes", authenticate, inspireController.applyChanges);

module.exports = router;
