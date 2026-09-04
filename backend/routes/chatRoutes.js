const express = require("express");
const { body, param } = require("express-validator");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/chatController");

const router = express.Router();

router.get("/", protect, ctrl.getConversations);

router.get(
  "/:claimId",
  protect,
  [param("claimId").isMongoId().withMessage("Invalid conversation.")],
  validate,
  ctrl.getMessages
);

router.post(
  "/:claimId",
  protect,
  [
    param("claimId").isMongoId().withMessage("Invalid conversation."),
    body("text").trim().isLength({ min: 1, max: 2000 }).withMessage("Message cannot be empty."),
  ],
  validate,
  ctrl.sendMessage
);

module.exports = router;