const jwt = require("jsonwebtoken");

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// Sends the JWT as an httpOnly, secure cookie (mitigates XSS token theft)
// and also returns it in the JSON body for clients that prefer header auth.
function sendTokenResponse(user, statusCode, res) {
  const token = signToken(user._id);
  const days = Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 7;

  res.cookie("token", token, {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    },
  });
}

module.exports = { signToken, sendTokenResponse };
