const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const inspireController = require("../controllers/inspirePromptController");

/**
 * @route POST /inspire/call
 * @desc Handle inspire prompts via LLM
 * @access Private
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
