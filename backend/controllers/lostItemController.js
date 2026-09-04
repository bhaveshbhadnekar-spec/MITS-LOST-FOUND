const LostItem = require("../models/LostItem");

// @route POST /api/lost-items
exports.createLostItem = async (req, res, next) => {
  try {
    const { itemName, category, description, dateLost, location, contact } = req.body;
    const item = await LostItem.create({
      itemName,
      category,
      description,
      dateLost,
      location,
      contact,
      image: req.file ? req.file.path : "",
      reportedBy: req.user._id,
    });
    res.status(201).json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/lost-items  (search + filter + sort)
exports.getLostItems = async (req, res, next) => {
  try {
    const { q, category, status, building, sort = "latest", page = 1, limit = 12 } = req.query;
    const filter = {};

    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (building) filter.location = building;

    const sortOption = sort === "category" ? { category: 1 } : { dateLost: -1 };

    const items = await LostItem.find(filter)
      .populate("reportedBy", "name email department")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await LostItem.countDocuments(filter);

    // Never send a reporter's phone/contact info to random browsers. Only the
    // reporter themselves or staff (admin/security) get to see it directly —
    // everyone else should talk through the in-app chat (see /api/chats).
    const safeItems = items.map((item) => {
      const obj = item.toObject();
      const isOwner = String(item.reportedBy._id) === String(req.user._id);
      const isStaff = ["admin", "security"].includes(req.user.role);
      if (!isOwner && !isStaff) delete obj.contact;
      return obj;
    });

    res.status(200).json({ success: true, count: items.length, total, items: safeItems });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/lost-items/:id
exports.getLostItem = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id).populate("reportedBy", "name email");
    if (!item) return res.status(404).json({ success: false, message: "Lost item report not found." });

    const obj = item.toObject();
    const isOwner = String(item.reportedBy._id) === String(req.user._id);
    const isStaff = ["admin", "security"].includes(req.user.role);
    if (!isOwner && !isStaff) delete obj.contact;

    res.status(200).json({ success: true, item: obj });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/lost-items/mine
exports.getMyLostItems = async (req, res, next) => {
  try {
    const items = await LostItem.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/lost-items/:id/status  (admin)
exports.updateLostItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const item = await LostItem.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Lost item report not found." });
    res.status(200).json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/lost-items/:id  (owner or admin)
exports.deleteLostItem = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Lost item report not found." });

    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this report." });
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: "Report deleted." });
  } catch (err) {
    next(err);
  }
};