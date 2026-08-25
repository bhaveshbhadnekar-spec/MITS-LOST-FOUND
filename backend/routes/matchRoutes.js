const express = require("express");
const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/matchController");

const router = express.Router();

router.get("/", protect, ctrl.getAllMatches);
router.get("/lost/:id", protect, ctrl.getMatchesForLostItem);
router.get("/found/:id", protect, ctrl.getMatchesForFoundItem);

module.exports = router;