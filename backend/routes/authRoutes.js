const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiters");
const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters"),
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  ctrl.register
);

router.post(
  "/login",
  authLimiter,
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate,
  ctrl.login
);

router.post("/google", authLimiter, ctrl.googleLogin);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().normalizeEmail()],
  validate,
  ctrl.forgotPassword
);

router.post(
  "/reset-password/:token",
  authLimiter,
  [body("password").isLength({ min: 8 })],
  validate,
  ctrl.resetPassword
);

router.get("/me", protect, ctrl.getMe);
router.post("/logout", protect, ctrl.logout);

module.exports = router;
