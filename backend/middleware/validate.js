const { validationResult } = require("express-validator");

// Runs after express-validator's checks; returns a clean 400 on failure
// instead of letting bad input reach controllers/DB.
module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};
