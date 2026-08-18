const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "No token, authorization denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user every time a protected route is used
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Block suspended users even if they already have a token
    if (user.isSuspended) {
      return res.status(403).json({
        message: "Your account has been suspended.",
      });
    }

    req.user = {
      id: user._id,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token is not valid",
    });
  }
};
