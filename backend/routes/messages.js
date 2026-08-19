const express = require("express");
const Message = require("../models/Message");
const Match = require("../models/Match");
const auth = require("../middleware/auth");
const router = express.Router();

// Get chat history between me and another user
router.get("/:userId", auth, async (req, res) => {
  try {
    const isMatch = await Match.exists({ users: { $all: [req.user.id, req.params.userId] } });
    if (!isMatch) return res.status(403).json({ message: "You can only message your matches" });

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name profilePic")
      .populate("receiver", "name profilePic");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a message (REST version - optional, mainly for fallback)
router.post("/", auth, async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const isMatch = await Match.exists({ users: { $all: [req.user.id, receiver] } });
    if (!isMatch) return res.status(403).json({ message: "You can only message your matches" });
    if (!content?.trim()) return res.status(400).json({ message: "Message content is required" });

    const message = await Message.create({
      sender: req.user.id,
      receiver,
      content,
    });

    const populated = await message.populate([
      { path: "sender", select: "name profilePic" },
      { path: "receiver", select: "name profilePic" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;