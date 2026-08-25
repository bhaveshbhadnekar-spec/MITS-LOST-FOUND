const Notification = require("../models/Notification");

// @route GET /api/notifications
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: "Notification not found." });
    res.status(200).json({ success: true, notification: notif });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
};
