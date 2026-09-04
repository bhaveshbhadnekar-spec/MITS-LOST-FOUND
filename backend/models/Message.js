const mongoose = require("mongoose");

// Every message belongs to exactly one Claim thread. This automatically
// scopes each conversation to just the two people involved (the claimant
// and the finder of that item) — nobody else can ever see or join it.
const messageSchema = new mongoose.Schema(
  {
    claim: { type: mongoose.Schema.Types.ObjectId, ref: "Claim", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ claim: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);