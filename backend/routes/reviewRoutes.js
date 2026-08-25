const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/reviewController");

const router = express.Router();

router.post(
  "/",
  protect,
  [
    body("claimId").isMongoId().withMessage("Valid claim ID is required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  ],
  validate,
  ctrl.createReview
);

router.get("/finder/:userId", protect, ctrl.getFinderReviews);

module.exports = router;