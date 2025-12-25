const express = require("express");
const router = express.Router();
const chatMessageController = require("../controllers/chatMessageController");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, chatMessageController.createMessage);
router.post("/bulk", authenticate, chatMessageController.bulkCreateMessages);
router.get("/:tripId", authenticate, chatMessageController.getMessagesByTrip);
router.delete(
  "/:tripId",
  authenticate,
  chatMessageController.deleteMessagesByTrip
);

module.exports = router;
