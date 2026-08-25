const express = require("express");
const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, ctrl.getMyNotifications);
router.patch("/:id/read", protect, ctrl.markAsRead);
router.patch("/read-all", protect, ctrl.markAllAsRead);

module.exports = router;
