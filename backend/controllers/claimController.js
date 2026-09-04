const Claim = require("../models/Claim");
const FoundItem = require("../models/FoundItem");
const Notification = require("../models/Notification");

// @route POST /api/claims
exports.createClaim = async (req, res, next) => {
  try {
    const { itemId, ownershipDescription, identificationDetails } = req.body;

    const foundItem = await FoundItem.findById(itemId);
    if (!foundItem) return res.status(404).json({ success: false, message: "Found item not found." });
    if (foundItem.status !== "Active") {
      return res.status(400).json({ success: false, message: "This item is no longer available to claim." });
    }

    const claim = await Claim.create({
      user: req.user._id,
      item: itemId,
      ownershipDescription,
      identificationDetails,
      proof: req.file ? req.file.path : "",
    });

    foundItem.status = "Claimed";
    await foundItem.save();

    await Notification.create({
      user: foundItem.reportedBy,
      type: "new_claim",
      message: `${req.user.name} submitted a claim for "${foundItem.itemName}" that you reported found. Review it in "My Claims".`,
    });

    res.status(201).json({ success: true, claim });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/claims/mine
exports.getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ user: req.user._id })
      .populate({ path: "item", populate: { path: "reportedBy", select: "name" } })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, claims });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/claims/received
// Claims other people have submitted on items *this* user reported as found.
exports.getReceivedClaims = async (req, res, next) => {
  try {
    const myFoundItems = await FoundItem.find({ reportedBy: req.user._id }).select("_id");
    const itemIds = myFoundItems.map((it) => it._id);

    const claims = await Claim.find({ item: { $in: itemIds } })
      .populate("item")
      .populate("user", "name email department")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, claims });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/claims  (admin: all claims)
exports.getAllClaims = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const claims = await Claim.find(filter)
      .populate("item")
      .populate("user", "name email department")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, claims });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/claims/:id/decision  (admin/security, OR the finder who reported the item)
exports.decideClaim = async (req, res, next) => {
  try {
    const { decision, adminNote } = req.body; // decision: "Approved" | "Rejected" | "Under Review"
    const claim = await Claim.findById(req.params.id).populate("item");
    if (!claim) return res.status(404).json({ success: false, message: "Claim not found." });

    const isAdmin = ["admin", "security"].includes(req.user.role);
    const isFinder = String(claim.item.reportedBy) === String(req.user._id);
    if (!isAdmin && !isFinder) {
      return res.status(403).json({ success: false, message: "You can only decide on claims for items you reported as found." });
    }

    claim.status = decision;
    claim.adminNote = adminNote || "";
    claim.reviewedBy = req.user._id;
    await claim.save();

    if (decision === "Approved") {
      claim.item.status = "Recovered";
      await claim.item.save();
    }
    if (decision === "Rejected") {
      claim.item.status = "Active"; // reopen item for other claimants
      await claim.item.save();
    }

    await Notification.create({
      user: claim.user,
      type: decision === "Approved" ? "claim_approved" : decision === "Rejected" ? "claim_rejected" : "report_update",
      message:
        decision === "Approved"
          ? `Your claim for "${claim.item.itemName}" has been approved.`
          : decision === "Rejected"
          ? `Your claim for "${claim.item.itemName}" has been rejected.`
          : `Admin requested more information for your claim on "${claim.item.itemName}".`,
    });

    // Let the finder know too, so they see their found item was successfully returned
    if (decision === "Approved") {
      await Notification.create({
        user: claim.item.reportedBy,
        type: "item_returned",
        message: `Great news — "${claim.item.itemName}" that you reported found has been returned to its owner. Thank you for helping out!`,
      });
    }

    res.status(200).json({ success: true, claim });
  } catch (err) {
    next(err);
  }
};