const express = require("express");
const User = require("../models/User");
const Match = require("../models/Match");
const auth = require("../middleware/auth");
const router = express.Router();

// Swipe right (like a user)
router.post("/like/:id", auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    // Add to likes
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { likes: targetUserId },
    });

    // Check if the other user already liked me → create match
    const targetUser = await User.findById(targetUserId);
    const isMutual = targetUser.likes.some(
  (id) => id.toString() === currentUserId
);

    if (isMutual) {
      // Check if match already exists
      const existingMatch = await Match.findOne({
        users: { $all: [currentUserId, targetUserId] },
      });

      if (!existingMatch) {
        const newMatch = await Match.create({
          users: [currentUserId, targetUserId],
        });
        return res.json({ matched: true, match: newMatch });
      }
    }

    res.json({ matched: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all my matches
router.get("/", auth, async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user.id,
    }).populate("users", "name university department profilePic interests");

    // Return the other user in each match
    const result = matches.map((match) => {
      const otherUser = match.users.find(
        (u) => u._id.toString() !== req.user.id
      );
      return {
        matchId: match._id,
        user: otherUser,
        createdAt: match.createdAt,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;