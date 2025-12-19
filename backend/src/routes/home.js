const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

/**
 * @route   GET /v1/home/trips
 * @desc    Get random trips for home page
 * @access  Public
 */
router.get("/trips", homeController.getHomeTrips);

/**
 * @route   GET /v1/home/cities
 * @desc    Get popular cities for home page carousel
 * @access  Public
 */
router.get("/cities", homeController.getHomeCities);

/**
 * @route   GET /v1/home/travelers
 * @desc    Get featured travelers for home page
 * @access  Public
 */
router.get("/travelers", homeController.getHomeTravelers);

module.exports = router;
