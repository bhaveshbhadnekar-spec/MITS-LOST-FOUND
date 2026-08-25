const express = require("express");
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { upload } = require("../config/cloudinary");
const ctrl = require("../controllers/foundItemController");

const router = express.Router();

router.get("/", ctrl.getFoundItems);
router.get("/mine", protect, ctrl.getMyFoundItems);
router.get("/:id", ctrl.getFoundItem);

router.post(
  "/",
  protect,
  upload.single("image"),
  [
    body("itemName").trim().notEmpty().withMessage("Item name is required"),
    body("category").notEmpty(),
    body("description").trim().isLength({ min: 5, max: 1000 }),
    body("dateFound").isISO8601().withMessage("A valid date is required"),
    body("location").trim().notEmpty(),
  ],
  validate,
  ctrl.createFoundItem
);

router.patch("/:id/status", protect, authorize("admin", "security"), ctrl.updateFoundItemStatus);
router.delete("/:id", protect, ctrl.deleteFoundItem);

module.exports = router;
