const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// Get current logged-in user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put("/me", auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true },
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get suggested users (simple version)
router.get("/suggestions", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const usersWhoBlockedCurrentUser = await User.find({
      blockedUsers: req.user.id,
    }).distinct("_id");

    const users = await User.find({
      _id: {
        $nin: [
          req.user.id,
          ...currentUser.likes,
          ...currentUser.blockedUsers,
          ...usersWhoBlockedCurrentUser,
        ],
      },
    }).select("-password");

    // Optional: simple filtering by common interests / same university
    // You can improve this later on frontend or here
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Upload profile picture
router.post(
  "/me/profile-picture",
  auth,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select an image",
        });
      }

      const imagePath = `/uploads/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          $set: {
            profilePic: imagePath,
          },
        },
        {
          new: true,
        },
      ).select("-password");

      res.json(user);
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  },
);

// Get single user by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      blockedUsers: { $ne: req.user.id },
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const currentUser = await User.findById(req.user.id).select("blockedUsers");
    if (currentUser.blockedUsers.some((blockedUser) => blockedUser.equals(user._id))) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Block a user
router.post("/block/:id", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { blockedUsers: req.params.id },
    });
    res.json({ message: "User blocked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all users
router.get("/", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser.isAdmin) {
      return res.status(403).json({ message: "Admin only" });
    }
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
