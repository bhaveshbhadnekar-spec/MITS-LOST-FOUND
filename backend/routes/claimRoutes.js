const express = require("express");
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { upload } = require("../config/cloudinary");
const ctrl = require("../controllers/claimController");

const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("proof"),
  [
    body("itemId").isMongoId().withMessage("Valid item ID is required"),
    body("ownershipDescription").trim().isLength({ min: 10, max: 1000 }),
    body("identificationDetails").trim().isLength({ min: 5, max: 500 }),
  ],
  validate,
  ctrl.createClaim
);

router.get("/mine", protect, ctrl.getMyClaims);
router.get("/", protect, authorize("admin", "security"), ctrl.getAllClaims);
router.patch(
  "/:id/decision",
  protect,
  authorize("admin", "security"),
  [body("decision").isIn(["Approved", "Rejected", "Under Review"])],
  validate,
  ctrl.decideClaim
);

module.exports = router;
