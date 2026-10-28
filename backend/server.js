require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const cacheMiddleware = require('./utils/cache');
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiters");

const authRoutes = require("./routes/authRoutes");
const lostItemRoutes = require("./routes/lostItemRoutes");
const foundItemRoutes = require("./routes/foundItemRoutes");
const claimRoutes = require("./routes/claimRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const matchRoutes = require("./routes/matchRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const chatRoutes = require("./routes/chatRoutes");
const aiRoutes = require("./routes/aiRoutes");

connectDB();

const app = express();

// --- Security middleware ---
app.use(helmet()); // sets secure HTTP headers, mitigates common XSS/clickjacking vectors
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" })); // body-size limit guards against payload-flood DoS
app.use(cookieParser());
app.use(mongoSanitize()); // strips '$' and '.' operators from user input -> MongoDB injection protection
app.use(xss()); // sanitizes user input from malicious HTML/JS -> XSS protection
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/api", apiLimiter); // global rate limiting on all API routes

// --- Routes ---
app.get("/api/health", (req, res) => res.status(200).json({ success: true, message: "MITS Lost & Found API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/lost-items", lostItemRoutes);
app.use("/api/found-items", foundItemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/ai", aiRoutes);

// 404 handler for unmatched API routes
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found." });
});

// Central error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MITS Lost & Found API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

// Guard against unhandled promise rejections crashing the process silently
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});

module.exports = app;