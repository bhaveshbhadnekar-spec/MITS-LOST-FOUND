const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/adminController");

const router = express.Router();

router.use(protect, authorize("admin", "security"));

router.get("/users", ctrl.getUsers);
router.patch("/users/:id/suspend", ctrl.suspendUser);
router.patch("/users/:id/reinstate", ctrl.reinstateUser);
router.get("/analytics", ctrl.getAnalytics);
router.delete("/lost-items/:id", ctrl.deleteSpamLostItem);
router.delete("/found-items/:id", ctrl.deleteSpamFoundItem);

module.exports = router;
