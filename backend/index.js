import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

import authRouter from "./src/routes/auth.route.js";
import userRouter from "./src/routes/user.route.js";
import roomRouter from "./src/routes/room.route.js";
import chatRouter from "./src/routes/chat.route.js";
import connectDB from "./src/connections/mongo_connection.js";

import Message from "./src/models/message.model.js";
import RoomMessage from "./src/models/room_chat.model.js";
import Chat from "./src/models/chats.model.js";

import { JWT_SECRET } from "./src/config/env.js";


const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3003;
const NODE_ENV = process.env.NODE_ENV || "development";

const FRONTEND_URL =
  NODE_ENV === "production"
    ? ["https://chat-app-coral-psi.vercel.app", "https://chat-app-l5l5.vercel.app"]
    : "http://localhost:5173"; // change if needed


app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());


connectDB();


const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket Auth
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = { id: decoded.id };
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});


const onlineUsers = new Map(); // userId => Set(socketId)

io.on("connection", (socket) => {
  const userId = socket.user.id;

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id);

  console.log(`User connected: ${userId}`);

  // JOIN ROOM
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(` User ${userId} joined room ${roomId}`);
  });

  // TYPING
  socket.on("typing", (roomId) => {
    socket.to(roomId).emit("typing", { userId });
  });

  socket.on("stop_typing", (roomId) => {
    socket.to(roomId).emit("stop_typing", { userId });
  });

  socket.on("send_message", async (data) => {
    const { message, to, isGroup = false, messageType = "text" } = data;

    try {
      let newMessage;

      if (isGroup) {
        newMessage = await RoomMessage.create({
          room: to,
          sender: userId,
          content: message,
          messageType,
        });
      } else {
        newMessage = await Message.create({
          sender: userId,
          chat: to,
          content: message,
          messageType,
        });

        await Chat.findByIdAndUpdate(to, {
          lastMessage: newMessage._id,
        });
      }

      const populatedMsg = await newMessage.populate(
        "sender",
        "name dp"
      );

      io.to(to).emit("recv_msg", populatedMsg);

      if (!isGroup) {
        const chatDoc = await Chat.findById(to);
        if (chatDoc) {
          chatDoc.users.forEach((uId) => {
            const sockets = onlineUsers.get(uId.toString());
            if (sockets) {
              sockets.forEach((sid) => {
                io.to(sid).emit("new_message", populatedMsg);
              });
            }
          });
        }
      }
    } catch (err) {
      console.error(" Socket Message Error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });


  socket.on("disconnect", () => {
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
      }
    }
    console.log(` User disconnected: ${userId}`);
  });
});


app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/chat", chatRouter);


server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Frontend allowed: ${FRONTEND_URL}`);
});
