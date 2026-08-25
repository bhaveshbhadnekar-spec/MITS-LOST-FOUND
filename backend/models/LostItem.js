const mongoose = require("mongoose");

const lostItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true, maxlength: 120 },
    category: {
      type: String,
      required: true,
      enum: ["Mobile", "Laptop", "Wallet", "ID Card", "Keys", "Books", "Accessories", "Documents", "Others"],
    },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    dateLost: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Active", "Claimed", "Recovered", "Rejected"],
      default: "Active",
    },
  },
  { timestamps: true }
);

lostItemSchema.index({ itemName: "text", description: "text" });
lostItemSchema.index({ category: 1, status: 1, dateLost: -1 });

module.exports = mongoose.model("LostItem", lostItemSchema);
