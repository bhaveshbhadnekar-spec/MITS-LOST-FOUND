const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const { analyzeItemImage } = require("../controllers/aiController");

const router = express.Router();

// Memory storage keeps the image buffer in RAM for fast AI vision processing
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for camera photos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for AI recognition."), false);
    }
  },
});

router.post("/analyze-image", protect, memoryUpload.single("image"), analyzeItemImage);

module.exports = router;
