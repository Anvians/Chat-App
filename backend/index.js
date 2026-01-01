import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
console.log("SERVER SECRET CHECK:", process.env.JWT_SECRET);

import authRouter from './src/routes/auth.route.js';
import userRouter from './src/routes/user.route.js';
import roomRouter from './src/routes/room.route.js';
import chatRouter from './src/routes/chat.route.js';
import connectDB from './src/connections/mongo_connection.js';
import Message from './src/models/message.model.js';
import RoomMessage from './src/models/room_chat.model.js';
import Chat from './src/models/chats.model.js';

dotenv.config();

const app = express();
import { JWT_SECRET } from './src/config/env.js';
const server_url = 'http://localhost:3003' ||   'https://chat-app-l5l5.vercel.app'

app.use(cors({
  origin: `${server_url}`,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://chat-app-coral-psi.vercel.app/',
    methods: ['GET', 'POST'],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error: Token missing'));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = { id: decoded.id };
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

const onlineUsers = new Map();
io.on('connection', (socket) => {
  const userId = socket.user.id;
  onlineUsers.set(userId, socket.id);
  console.log(`User connected: ${userId}`);

  socket.on('typing', (room) => {
    socket.to(room).emit('typing', { userId: socket.user.id });
  });

  socket.on('stop_typing', (room) => {
    socket.to(room).emit('stop_typing', { userId: socket.user.id });
  });

  socket.on('join_room', (data) => {
    const roomId = data.room || data;
    socket.join(roomId);
    console.log(`User ${userId} joined room: ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    const { message, to, isGroup = false, messageType = "text" } = data;
    const userId = socket.user.id;

    try {
      let newMessage;
      if (isGroup) {
        newMessage = await RoomMessage.create({
          room: to,
          sender: userId,
          content: message,
          messageType: messageType || "text"
        });
      } else {
        newMessage = await Message.create({
          sender: userId,
          chat: to,
          content: message,
          messageType: messageType || "text"
        });

        await Chat.findByIdAndUpdate(to, { lastMessage: newMessage._id });
      }

      const populatedMsg = await newMessage.populate("sender", "name dp");


      io.to(to).emit('recv_msg', populatedMsg);

      // Notify all users in the chat (for one-on-one chats)
      const chatDoc = await Chat.findById(to);
      if (chatDoc) {
        chatDoc.users.forEach(uId => {
          const userSocket = onlineUsers.get(uId.toString());
          if (userSocket) {
            io.to(userSocket).emit('new_chat_added', populatedMsg);
          }
        });
      }

    } catch (err) {
      console.error("Socket Message Error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    console.log(`User disconnected: ${userId}`);
  });
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/chat', chatRouter); 

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});