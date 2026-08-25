const User = require("../models/User");
const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const Claim = require("../models/Claim");

// @route GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/admin/users/:id/suspend
exports.suspendUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true, suspensionReason: reason || "Policy violation" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/admin/users/:id/reinstate
exports.reinstateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: false, suspensionReason: "" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, activeLost, activeFound, recoveredLost, recoveredFound, pendingClaims] = await Promise.all([
      User.countDocuments(),
      LostItem.countDocuments({ status: "Active" }),
      FoundItem.countDocuments({ status: "Active" }),
      LostItem.countDocuments({ status: "Recovered" }),
      FoundItem.countDocuments({ status: "Recovered" }),
      Claim.countDocuments({ status: { $in: ["Pending", "Under Review"] } }),
    ]);

    const totalReports = (await LostItem.countDocuments()) + (await FoundItem.countDocuments());
    const recovered = recoveredLost + recoveredFound;

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalReports,
        activeCases: activeLost + activeFound,
        recoveredItems: recovered,
        pendingClaims,
        recoveryRate: totalReports ? Math.round((recovered / totalReports) * 100) : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/admin/lost-items/:id  (spam removal)
exports.deleteSpamLostItem = async (req, res, next) => {
  try {
    await LostItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Report removed." });
  } catch (err) {
    next(err);
  }
};

exports.deleteSpamFoundItem = async (req, res, next) => {
  try {
    await FoundItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Report removed." });
  } catch (err) {
    next(err);
  }
};
