const mongoose = require("mongoose");

const foundItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true, maxlength: 120 },
    category: {
      type: String,
      required: true,
      enum: ["Mobile", "Laptop", "Wallet", "ID Card", "Keys", "Books", "Accessories", "Documents", "Others"],
    },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    dateFound: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, maxlength: 500 },
    image: { type: String, required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Active", "Claimed", "Recovered", "Rejected"],
      default: "Active",
    },
  },
  { timestamps: true }
);

foundItemSchema.index({ itemName: "text", description: "text" });
foundItemSchema.index({ category: 1, status: 1, dateFound: -1 });

module.exports = mongoose.model("FoundItem", foundItemSchema);
