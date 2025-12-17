const express = require("express");
const { body } = require("express-validator");
const tripDerivationController = require("../controllers/tripDerivationController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validator");

const router = express.Router();

// List derivations
router.get("/", tripDerivationController.getDerivations);

// Create derivation
router.post(
  "/",
  authenticate,
  [body("originalTripId").isUUID(), body("derivedTripId").optional().isUUID()],
  validate,
  tripDerivationController.createDerivation
);

// Delete derivation
router.delete("/:id", authenticate, tripDerivationController.deleteDerivation);

module.exports = router;
