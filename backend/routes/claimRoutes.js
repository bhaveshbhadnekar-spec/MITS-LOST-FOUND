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
router.get("/received", protect, ctrl.getReceivedClaims);
router.get("/", protect, authorize("admin", "security"), ctrl.getAllClaims);
// NOTE: authorize("admin","security") intentionally NOT applied here.
// decideClaim itself allows admin/security OR the finder who reported the
// item (see controllers/claimController.js -> isAdmin / isFinder check).
// Gating this route to admin/security only would make that finder branch
// unreachable and break the "finder approves/rejects claims on their own
// found item" flow.
router.patch(
  "/:id/decision",
  protect,
  [body("decision").isIn(["Approved", "Rejected", "Under Review"])],
  validate,
  ctrl.decideClaim
);

module.exports = router;