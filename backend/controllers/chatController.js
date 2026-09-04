const Claim = require("../models/Claim");
const Message = require("../models/Message");

// Loads a claim (with its item + finder) and confirms the logged-in user is
// one of the two legitimate participants: the claimant, or the finder who
// reported the item. Throws a 403/404 the same way for both "not found" and
// "not your conversation" so we don't leak which claim IDs exist.
async function loadAuthorizedClaim(claimId, userId) {
  const claim = await Claim.findById(claimId).populate("item", "reportedBy itemName");
  if (!claim) {
    const err = new Error("Conversation not found.");
    err.statusCode = 404;
    throw err;
  }

  const claimantId = String(claim.user);
  const finderId = String(claim.item.reportedBy);
  const isClaimant = claimantId === String(userId);
  const isFinder = finderId === String(userId);

  if (!isClaimant && !isFinder) {
    const err = new Error("You are not part of this conversation.");
    err.statusCode = 403;
    throw err;
  }

  const otherPartyId = isClaimant ? finderId : claimantId;
  return { claim, otherPartyId };
}

// @route GET /api/chats
// @desc  List every claim-conversation the logged-in user is part of
//        (as claimant or as finder), with the last message + unread count.
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const claims = await Claim.find({}).populate("item", "reportedBy itemName image");
    const myClaims = claims.filter(
      (c) => String(c.user) === String(userId) || String(c.item.reportedBy) === String(userId)
    );

    const conversations = await Promise.all(
      myClaims.map(async (claim) => {
        const isClaimant = String(claim.user) === String(userId);
        const otherPartyId = isClaimant ? claim.item.reportedBy : claim.user;

        const lastMessage = await Message.findOne({ claim: claim._id }).sort({ createdAt: -1 });
        const unreadCount = await Message.countDocuments({
          claim: claim._id,
          recipient: userId,
          readAt: null,
        });

        return {
          claimId: claim._id,
          itemName: claim.item.itemName,
          itemImage: claim.item.image,
          claimStatus: claim.status,
          otherPartyId,
          role: isClaimant ? "claimant" : "finder",
          lastMessage: lastMessage
            ? { text: lastMessage.text, at: lastMessage.createdAt, fromMe: String(lastMessage.sender) === String(userId) }
            : null,
          unreadCount,
        };
      })
    );

    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.at || 0;
      const bTime = b.lastMessage?.at || 0;
      return new Date(bTime) - new Date(aTime);
    });

    res.status(200).json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/chats/:claimId
// @desc  Get the full message thread for one claim. Marks the other
//        person's messages as read for the requester.
exports.getMessages = async (req, res, next) => {
  try {
    const { claim } = await loadAuthorizedClaim(req.params.claimId, req.user._id);

    const messages = await Message.find({ claim: claim._id }).sort({ createdAt: 1 });

    await Message.updateMany(
      { claim: claim._id, recipient: req.user._id, readAt: null },
      { readAt: new Date() }
    );

    res.status(200).json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/chats/:claimId
// @desc  Send a message in a claim's conversation. Only the claimant or the
//        finder of that specific claim's item may post here.
exports.sendMessage = async (req, res, next) => {
  try {
    const { claim, otherPartyId } = await loadAuthorizedClaim(req.params.claimId, req.user._id);

    const message = await Message.create({
      claim: claim._id,
      sender: req.user._id,
      recipient: otherPartyId,
      text: req.body.text,
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};