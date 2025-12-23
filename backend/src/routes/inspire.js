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

module.exports = router;
