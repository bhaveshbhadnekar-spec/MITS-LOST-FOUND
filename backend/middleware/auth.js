const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT (from Authorization header or httpOnly cookie) and
// attaches the authenticated user to req.user.
exports.protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }
    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: "Your account has been suspended." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session." });
  }
};

// Role-based access control: usage -> authorize("admin", "security")
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "You do not have permission to perform this action." });
  }
  next();
};
