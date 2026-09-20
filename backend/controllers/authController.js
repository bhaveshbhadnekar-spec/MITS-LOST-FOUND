const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { sendTokenResponse } = require("../utils/token");
const { sendPasswordResetEmail } = require("../utils/mailer");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    if (!User.isAllowedDomain(email)) {
      return res.status(400).json({ success: false, message: "Please register with your official MITS email address." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password, department });
    // In production: send a verification email here before setting isEmailVerified.
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: "This account has been suspended. Contact the Security Office." });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/google
// body: { idToken } from Google Identity Services on the frontend
exports.googleLogin = async (req, res, next) => {
  try {
    // Accept token from either "idToken" (legacy) or "credential" (Google Identity Services)
    const idToken = req.body.idToken || req.body.credential;
    if (!idToken) {
      return res.status(400).json({ success: false, message: "Google id token is required." });
    }

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      console.error('Google token verification returned no payload');
      return res.status(401).json({ success: false, message: "Invalid Google token." });
    }

    // Ensure email belongs to allowed MITS domain
    if (!User.isAllowedDomain(payload.email)) {
      return res.status(400).json({ success: false, message: "Please sign in with your official MITS Google account." });
    }

    // Find existing user or create a new one
    let user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        profileImage: payload.picture,
        isEmailVerified: payload.email_verified,
      });
    }

    // Issue JWT and cookie
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Google login error:', err);
    // Hide internal details from client but pass to error middleware for logging
    return res.status(401).json({ success: false, message: "Google authentication failed." });
  }
};

// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    // Always respond the same way whether or not the user exists, to avoid
    // leaking which emails are registered.
    // NAYA:
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (mailErr) {
        console.error(`Failed to send password reset email to ${user.email}: ${mailErr.message}`);
      }
    }
    res.status(200).json({ success: true, message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Reset link is invalid or has expired." });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// @route POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie("token", "none", { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.status(200).json({ success: true, message: "Logged out." });
};
