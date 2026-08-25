const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "FoundItem", required: true },
    ownershipDescription: { type: String, required: true, trim: true, maxlength: 1000 },
    identificationDetails: { type: String, required: true, trim: true, maxlength: 500 },
    proof: { type: String, default: "" }, // image URL of additional proof
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Approved", "Rejected"],
      default: "Pending",
    },
    adminNote: { type: String, trim: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

claimSchema.index({ item: 1, status: 1 });

module.exports = mongoose.model("Claim", claimSchema);
