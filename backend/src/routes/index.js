const express = require("express");
const authRoutes = require("./auth");
const userRoutes = require("./users");
const tripRoutes = require("./trips");
const tripLikeRoutes = require("./tripLikes");
const followRoutes = require("./follows");
const reviewRoutes = require("./reviews");
const tripDerivationRoutes = require("./tripDerivations");
const uploadRoutes = require("./upload");
const cityRoutes = require("./cities");
const placeRoutes = require("./places");
const placeFavoriteRoutes = require("./placeFavorites");
const llmRoutes = require("./llm");
const inspireRoutes = require("./inspire");
const searchRoutes = require("./search");
const homeRoutes = require("./home");
const chatMessageRoutes = require("./chatMessages");

const router = express.Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/trips", tripRoutes);
router.use("/trip-likes", tripLikeRoutes);
router.use("/follows", followRoutes);
router.use("/reviews", reviewRoutes);
router.use("/trip-derivations", tripDerivationRoutes);
router.use("/upload", uploadRoutes);
router.use("/cities", cityRoutes);
router.use("/places", placeRoutes);
router.use("/place-favorites", placeFavoriteRoutes);
router.use("/llm", llmRoutes);
router.use("/inspire", inspireRoutes);
router.use("/search", searchRoutes);
router.use("/home", homeRoutes);
router.use("/chat-messages", chatMessageRoutes);

module.exports = router;
