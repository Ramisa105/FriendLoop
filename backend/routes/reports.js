const express = require("express");
const Report = require("../models/Report");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// Create a report
router.post("/", auth, async (req, res) => {
  try {
    const { reportedUser, reason, description } = req.body;

    if (!reportedUser || !reason) {
      return res
        .status(400)
        .json({ message: "reportedUser and reason are required" });
    }

    // Prevent reporting yourself
    if (reportedUser === req.user.id) {
      return res.status(400).json({ message: "You cannot report yourself" });
    }

    const report = await Report.create({
      reportedBy: req.user.id,
      reportedUser,
      reason,
      description,
    });

    const populated = await report.populate([
      { path: "reportedBy", select: "name email" },
      { path: "reportedUser", select: "name email" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all reports
router.get("/", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser.isAdmin) {
      return res.status(403).json({ message: "Admin only" });
    }

    const reports = await Report.find()
      .populate("reportedBy", "name email")
      .populate("reportedUser", "name email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update report status
router.put("/:id", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser.isAdmin) {
      return res.status(403).json({ message: "Admin only" });
    }

    const { status } = req.body;
    if (!["pending", "reviewed", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    )
      .populate("reportedBy", "name email")
      .populate("reportedUser", "name email");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Decide what to do with reported account
router.put("/:id/action", auth, async (req, res) => {
  try {
    // Check admin
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({
        message: "Admin only",
      });
    }

    const { action } = req.body;

    if (!["keep", "suspend"].includes(action)) {
      return res.status(400).json({
        message: "Invalid action",
      });
    }

    // Find report
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // Find reported user
    const reportedUser = await User.findById(report.reportedUser);

    if (!reportedUser) {
      return res.status(404).json({
        message: "Reported user not found",
      });
    }

    // -----------------------------------
    // KEEP ACCOUNT
    // -----------------------------------

    if (action === "keep") {
      reportedUser.isSuspended = false;

      report.status = "resolved";
      report.actionTaken = "kept";
    }

    // -----------------------------------
    // SUSPEND ACCOUNT
    // -----------------------------------

    if (action === "suspend") {
      reportedUser.isSuspended = true;

      report.status = "resolved";
      report.actionTaken = "suspended";
    }

    await reportedUser.save();
    await report.save();

    const populatedReport = await Report.findById(report._id)
      .populate("reportedBy", "name email")
      .populate("reportedUser", "name email isSuspended");

    res.json(populatedReport);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
