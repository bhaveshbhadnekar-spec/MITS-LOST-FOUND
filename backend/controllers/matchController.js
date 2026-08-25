const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");

// Common words to ignore while comparing descriptions, so matches are based
// on meaningful words (e.g. "wallet", "black") not filler words.
const STOPWORDS = new Set([
  "a", "an", "the", "is", "was", "my", "of", "in", "on", "at", "and", "with",
  "near", "to", "it", "its", "this", "that", "i", "lost", "found", "please",
  "item", "somewhere", "around", "there",
]);

function tokenize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w));
}

// Jaccard similarity: how much overlap between two sets of words, 0 to 1
function textSimilarity(a = "", b = "") {
  const aTokens = new Set(tokenize(a));
  const bTokens = new Set(tokenize(b));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  let common = 0;
  aTokens.forEach((t) => {
    if (bTokens.has(t)) common++;
  });
  const union = new Set([...aTokens, ...bTokens]).size;
  return common / union;
}

function daysBetween(d1, d2) {
  return Math.abs(new Date(d1) - new Date(d2)) / (1000 * 60 * 60 * 24);
}

// Scores 0-100 how likely a lost item and a found item are the same item.
// This is a rule-based "smart matching" score (category + keyword overlap +
// location + date proximity) — not a generative AI model, but works
// deterministically without needing any external AI API key.
function scoreMatch(lost, found) {
  let score = 0;

  // Item name similarity is the strongest signal — a "bag" and a "key" should
  // never score high just because they share a few generic description words.
  const nameSim = textSimilarity(lost.itemName, found.itemName);
  score += nameSim * 55;

  // Description overlap is a secondary signal
  const descSim = textSimilarity(lost.description, found.description);
  score += descSim * 25;

  if (lost.location && found.location) {
    const locA = lost.location.toLowerCase().trim();
    const locB = found.location.toLowerCase().trim();
    if (locA === locB) score += 12;
    else if (locA.includes(locB) || locB.includes(locA)) score += 6;
  }

  const days = daysBetween(lost.dateLost, found.dateFound);
  if (days <= 3) score += 8;
  else if (days <= 10) score += 4;

  // Safety net: if the item names AND descriptions share almost no words
  // (e.g. "bag" vs "key" with unrelated descriptions), this is almost
  // certainly not the same item — cap the score low regardless of how well
  // location/date happen to line up. We check both name and description so
  // a simple typo in the item name (e.g. "pen" vs "ppen") doesn't get
  // wrongly suppressed when the descriptions clearly describe the same item.
  if (nameSim === 0 && descSim < 0.2) {
    score = Math.min(score, 35);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// @route GET /api/matches
// Returns the best lost<->found pairs across the whole system (active items only)
exports.getAllMatches = async (req, res, next) => {
  try {
    const [lostItems, foundItems] = await Promise.all([
      LostItem.find({ status: "Active" }).populate("reportedBy", "name email"),
      FoundItem.find({ status: "Active" }).populate("reportedBy", "name email"),
    ]);

    const matches = [];
    for (const lost of lostItems) {
      for (const found of foundItems) {
        const score = scoreMatch(lost, found);
        if (score >= 40) {
          matches.push({ lostItem: lost, foundItem: found, score });
        }
      }
    }
    matches.sort((a, b) => b.score - a.score);

    res.status(200).json({ success: true, count: matches.length, matches: matches.slice(0, 30) });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/matches/lost/:id
// Returns best found-item matches for one specific lost item report
exports.getMatchesForLostItem = async (req, res, next) => {
  try {
    const lost = await LostItem.findById(req.params.id);
    if (!lost) return res.status(404).json({ success: false, message: "Lost item report not found." });

    const foundItems = await FoundItem.find({ status: "Active" }).populate("reportedBy", "name email");
    const matches = foundItems
      .map((found) => ({ foundItem: found, score: scoreMatch(lost, found) }))
      .filter((m) => m.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.status(200).json({ success: true, matches });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/matches/found/:id
// Returns best lost-item matches for one specific found item report
exports.getMatchesForFoundItem = async (req, res, next) => {
  try {
    const found = await FoundItem.findById(req.params.id);
    if (!found) return res.status(404).json({ success: false, message: "Found item report not found." });

    const lostItems = await LostItem.find({ status: "Active" }).populate("reportedBy", "name email");
    const matches = lostItems
      .map((lost) => ({ lostItem: lost, score: scoreMatch(lost, found) }))
      .filter((m) => m.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.status(200).json({ success: true, matches });
  } catch (err) {
    next(err);
  }
};