const express = require("express");
const { body } = require("express-validator");
const followController = require("../controllers/followController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validator");

const router = express.Router();

// Get followers
router.get("/followers/:userId", followController.getFollowers);

// Get following
router.get("/following/:userId", followController.getFollowing);

// Follow a user
router.post(
  "/",
  authenticate,
  [body("followeeId").isUUID()],
  validate,
  followController.followUser
);

// Unfollow a user
router.delete("/:id", authenticate, followController.unfollowUser);

// Check if following a user
router.get("/check/:userId", authenticate, followController.checkFollowStatus);

module.exports = router;
