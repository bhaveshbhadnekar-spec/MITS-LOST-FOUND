const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mits-lost-found",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 1200, crop: "limit" }],
  },
});

// Secure file upload validation: mime-type + size checks (defense in depth,
// on top of allowed_formats above).
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, or WEBP images are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

module.exports = { cloudinary, upload };
