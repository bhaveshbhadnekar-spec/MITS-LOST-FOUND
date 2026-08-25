const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    type: {
      type: String,
      enum: ["claim_approved", "claim_rejected", "report_update", "admin_message", "new_claim", "item_returned"],
      default: "report_update",
    },
    read: { type: Boolean, default: false },
    link: { type: String }, // optional deep link e.g. /claims/:id
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);