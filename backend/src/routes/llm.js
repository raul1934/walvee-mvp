const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const llmController = require("../controllers/llmController");

/**
 * @route   POST /llm/chat
 * @desc    Send a chat message to the LLM and get a response
 * @access  Private (requires authentication)
 */
router.post("/chat", authenticate, llmController.chat);

module.exports = router;
