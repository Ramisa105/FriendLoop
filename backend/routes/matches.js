const express = require("express");
const User = require("../models/User");
const Match = require("../models/Match");
const auth = require("../middleware/auth");

const router = express.Router();

// ======================================================
// LIKE A USER
// ======================================================

router.post("/like/:id", auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    // Prevent liking yourself
    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        message: "You cannot like yourself",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Add target user to my likes
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: {
        likes: targetUserId,
      },
    });

    // Check if target user already liked me
    const isMutual = targetUser.likes.some(
      (id) => id.toString() === currentUserId.toString(),
    );

    // Not a match yet
    if (!isMutual) {
      return res.json({
        matched: false,
      });
    }

    // Check if match already exists
    let match = await Match.findOne({
      users: {
        $all: [currentUserId, targetUserId],
      },
    });

    // Create match if it doesn't exist
    if (!match) {
      match = await Match.create({
        users: [currentUserId, targetUserId],
      });
    }

    return res.json({
      matched: true,
      match,
    });
  } catch (err) {
    console.error("LIKE ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// ======================================================
// GET ALL MY MATCHES
// ======================================================

router.get("/", auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const usersWhoBlockedCurrentUser = await User.find({
      blockedUsers: currentUserId,
    }).distinct("_id");
    const blockedUserIds = [
      ...currentUser.blockedUsers,
      ...usersWhoBlockedCurrentUser,
    ];

    // Find users I liked who also liked me
    const mutualUsers = await User.find({
      _id: {
        $in: currentUser.likes,
        $nin: blockedUserIds,
      },

      likes: currentUserId,
      blockedUsers: { $nin: [currentUserId] },

      isSuspended: {
        $ne: true,
      },
    });

    // Create any missing Match documents
    for (const mutualUser of mutualUsers) {
      const existingMatch = await Match.findOne({
        users: {
          $all: [currentUserId, mutualUser._id],
        },
      });

      if (!existingMatch) {
        await Match.create({
          users: [currentUserId, mutualUser._id],
        });
      }
    }

    // Get all matches
    const matches = await Match.find({
      users: currentUserId,
    })
      .populate(
        "users",
        "name university department semester bio profilePic interests skills friendshipGoals isSuspended",
      )
      .sort({
        createdAt: -1,
      });

    // Return only the other user
    const result = matches
      .map((match) => {
        const otherUser = match.users.find(
          (u) => u && u._id.toString() !== currentUserId.toString(),
        );

        // Don't display suspended/deleted/blocked users
        if (
          !otherUser ||
          otherUser.isSuspended ||
          blockedUserIds.some(
            (blockedUserId) =>
              blockedUserId.toString() === otherUser._id.toString(),
          )
        ) {
          return null;
        }

        return {
          matchId: match._id,
          user: otherUser,
          createdAt: match.createdAt,
        };
      })
      .filter(Boolean);

    res.json(result);
  } catch (err) {
    console.error("GET MATCHES ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
