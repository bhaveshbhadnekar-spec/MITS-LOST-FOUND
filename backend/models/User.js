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

// Enforce MITS-only email domains at the schema level as a defense-in-depth
// check (also validated in the auth controller before this point).
// Allowed domains:
//   @mitsgwl.ac.in  -> students
//   @mitsgwalior.in -> faculty / admin staff
userSchema.statics.isAllowedDomain = function (email) {
  const lower = email.toLowerCase();
  return (
    lower.endsWith("@mitsgwl.ac.in") ||
    lower.endsWith("@mitsgwalior.in")
  );
};

// Determine the default role for a new user based on their email.
// - Faculty admin override: dixitmits@mitsgwalior.in -> "admin"
// - Other faculty domain (@mitsgwalior.in)           -> "faculty"
// - Student domain (@mitsgwl.ac.in)                  -> "student"
userSchema.statics.getDefaultRole = function (email) {
  const lower = email.toLowerCase();
  // Special admin override for the faculty admin email
  if (lower === "dixitmits@mitsgwalior.in") return "admin";
  if (lower.endsWith("@mitsgwalior.in")) return "faculty";
  return "student";
};

module.exports = mongoose.model("User", userSchema);