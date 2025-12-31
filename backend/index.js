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

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
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

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room: ${roomId}`);
  });

  socket.on('send_message', async ({ message, to, isGroup, messageType }) => {
    const userId = socket.user.id;

    if (isGroup) {
      try {
        const newMessage = await RoomMessage.create({
          room: to,
          sender: userId,
          content: message,
          messageType: messageType || "text"
        });

        const populatedMsg = await newMessage.populate("sender", "name dp");

        io.to(to).emit('recv_msg', populatedMsg);
      } catch (err) {
        console.error("Socket Message Error:", err);
      }
    } else {
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
app.use('/api/chat', chatRouter); // Message history

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});