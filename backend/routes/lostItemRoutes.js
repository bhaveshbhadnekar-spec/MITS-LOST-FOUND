const express = require("express");
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { upload } = require("../config/cloudinary");
const ctrl = require("../controllers/lostItemController");

const router = express.Router();

router.get("/", ctrl.getLostItems);
router.get("/mine", protect, ctrl.getMyLostItems);
router.get("/:id", ctrl.getLostItem);

router.post(
  "/",
  protect,
  upload.single("image"),
  [
    body("itemName").trim().notEmpty().withMessage("Item name is required"),
    body("category").notEmpty(),
    body("description").trim().isLength({ min: 5, max: 1000 }),
    body("dateLost").isISO8601().withMessage("A valid date is required"),
    body("location").trim().notEmpty(),
    body("contact").trim().notEmpty(),
  ],
  validate,
  ctrl.createLostItem
);

router.patch("/:id/status", protect, authorize("admin", "security"), ctrl.updateLostItemStatus);
router.delete("/:id", protect, ctrl.deleteLostItem);

module.exports = router;
