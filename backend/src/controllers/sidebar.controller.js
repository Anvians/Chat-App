import mongoose from 'mongoose';
import Chat from '../models/chats.model.js'
import Room from '../models/rooms.model.js'


export const getMySidebarChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      users: { $elemMatch: { $eq: userId } }
    })
      .populate("users", "id name username dp")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    const formattedChats = chats.map((chat) => {
      const otherUser = chat.isGroupChat
        ? null
        : chat.users.find(
            (u) => u._id.toString() !== userId
          );

      return {
        id: chat._id,
        isGroup: chat.isGroupChat,
        name: chat.isGroupChat ? chat.chatName : otherUser?.name,
        dp: chat.isGroupChat ? "" : otherUser?.dp,
        lastMessage: chat.lastMessage?.content || "",
        updatedAt: chat.updatedAt
      };
    });

    const rooms = await Room.find({
      members: userId
    })
      .populate("admin", "name")
      .sort({ updatedAt: -1 });

    const formattedRooms = rooms.map((room) => ({
      id: room._id,
      isGroup: true,
      name: room.name,
      dp: "",
      lastMessage: "",
      updatedAt: room.updatedAt
    }));

    const sidebar = [...formattedChats, ...formattedRooms].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    res.json(sidebar);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
