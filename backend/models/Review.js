const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    claim: { type: mongoose.Schema.Types.ObjectId, ref: "Claim", required: true, unique: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "FoundItem", required: true },
    finder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ finder: 1 });

module.exports = mongoose.model("Review", reviewSchema);