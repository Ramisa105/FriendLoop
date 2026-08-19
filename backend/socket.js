const Message = require("./models/Message");
const Match = require("./models/Match");
const jwt = require("jsonwebtoken");

module.exports = (io) => {
  // Simple authentication for socket (optional but recommended)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // Join a private room with the user's own ID
    socket.join(socket.userId);

    // Listen for new messages
    socket.on("sendMessage", async (data) => {
      try {
        const { receiverId, content } = data;
        const isMatch = await Match.exists({ users: { $all: [socket.userId, receiverId] } });
        if (!isMatch || !content?.trim()) {
          return socket.emit("messageError", { message: "You can only message your matches" });
        }

        // Save to database
        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content: content.trim(),
        });

        const populated = await message.populate([
          { path: "sender", select: "name profilePic" },
          { path: "receiver", select: "name profilePic" },
        ]);

        // Send to receiver
        io.to(receiverId).emit("receiveMessage", populated);

        // Also send back to sender (for confirmation)
        socket.emit("receiveMessage", populated);
      } catch (err) {
        console.error("Socket message error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
};