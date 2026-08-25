const FoundItem = require("../models/FoundItem");

// @route POST /api/found-items
exports.createFoundItem = async (req, res, next) => {
  try {
    const { itemName, category, description, dateFound, location, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "An image of the found item is required." });
    }

    const item = await FoundItem.create({
      itemName,
      category,
      description,
      dateFound,
      location,
      notes,
      image: req.file.path,
      reportedBy: req.user._id,
    });
    res.status(201).json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/found-items (search + filter + sort)
exports.getFoundItems = async (req, res, next) => {
  try {
    const { q, category, status, building, sort = "latest", page = 1, limit = 12 } = req.query;
    const filter = {};

    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (building) filter.location = building;

    const sortOption = sort === "category" ? { category: 1 } : { dateFound: -1 };

    const items = await FoundItem.find(filter)
      .populate("reportedBy", "name email department")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await FoundItem.countDocuments(filter);
    res.status(200).json({ success: true, count: items.length, total, items });
  } catch (err) {
    next(err);
  }
};

exports.getFoundItem = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id).populate("reportedBy", "name email");
    if (!item) return res.status(404).json({ success: false, message: "Found item report not found." });
    res.status(200).json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

exports.getMyFoundItems = async (req, res, next) => {
  try {
    const items = await FoundItem.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

exports.updateFoundItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const item = await FoundItem.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Found item report not found." });
    res.status(200).json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

exports.deleteFoundItem = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Found item report not found." });

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
