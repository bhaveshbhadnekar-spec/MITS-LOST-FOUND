const Claim = require("../models/Claim");
const Review = require("../models/Review");

// @route POST /api/reviews
// Only the person whose claim was Approved can leave a review, and only once per claim.
exports.createReview = async (req, res, next) => {
  try {
    const { claimId, rating, comment } = req.body;

    const claim = await Claim.findById(claimId).populate("item");
    if (!claim) return res.status(404).json({ success: false, message: "Claim not found." });

    if (String(claim.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only review your own approved claims." });
    }
    if (claim.status !== "Approved") {
      return res.status(400).json({ success: false, message: "You can only review a claim once it has been approved." });
    }

    const existing = await Review.findOne({ claim: claimId });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already reviewed this claim." });
    }

    const review = await Review.create({
      claim: claimId,
      item: claim.item._id,
      finder: claim.item.reportedBy,
      reviewer: req.user._id,
      rating,
      comment: comment || "",
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/reviews/finder/:userId
exports.getFinderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ finder: req.params.userId })
      .populate("reviewer", "name")
      .populate("item", "itemName")
      .sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    res.status(200).json({ success: true, count: reviews.length, avgRating, reviews });
  } catch (err) {
    next(err);
  }
};