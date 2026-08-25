const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: 8,
      select: false, // never returned by default queries
    },
    googleId: { type: String, select: false },
    role: {
      type: String,
      enum: ["student", "faculty", "staff", "admin", "security"],
      default: "student",
    },
    department: { type: String, trim: true },
    profileImage: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// Enforce MITS-only email domain at the schema level as a defense-in-depth
// check (also validated in the auth controller before this point).
userSchema.statics.isAllowedDomain = function (email) {
  const domain = process.env.ALLOWED_EMAIL_DOMAIN || "mitsgwl.ac.in";
  return email.toLowerCase().endsWith(`@${domain}`);
};

module.exports = mongoose.model("User", userSchema);
