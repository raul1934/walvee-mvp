const express = require("express");
const router = express.Router();
const { searchOverlay } = require("../controllers/searchController");
const { optionalAuth } = require("../middleware/auth");

/**
 * @route   GET /search/overlay
 * @desc    Global search across cities, trips, places, and travelers
 * @access  Public (travelers search requires authentication)
 * @query   query (required) - Search term
 * @query   cityContext (optional) - Filter by city context
 * @query   limit (optional) - Results per category (default: 5)
 */
router.get("/overlay", optionalAuth, searchOverlay);

module.exports = router;
