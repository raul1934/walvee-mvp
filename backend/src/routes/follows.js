const express = require("express");
const { body } = require("express-validator");
const followController = require("../controllers/followController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validator");

const router = express.Router();

// Get followers
router.get("/followers/:userId", followController.getFollowers);

// List follow records for the authenticated user
router.get("/", authenticate, followController.listUserFollows);

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

// Unfollow a user (specify user id to unfollow)
router.delete("/:userId", authenticate, followController.unfollowUser);

// Delete a follow record by id (allowed if the authenticated user is follower or followee)
router.delete("/record/:id", authenticate, followController.deleteFollowRecord);

// Check if following a user
router.get("/check/:userId", authenticate, followController.checkFollowStatus);

module.exports = router;
