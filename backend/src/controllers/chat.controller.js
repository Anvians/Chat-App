import mongoose from 'mongoose';
import Chat from '../models/chats.model.js';
import Message from '../models/message.model.js';
import Room from '../models/rooms.model.js';

export const accessChat = async (req, res) => {
  const { userId } = req.body; 
  const myId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: "UserId param not sent" });
  }

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [myId, userId] }
    }).populate("users", "name dp username")
      .populate("lastMessage");

    if (chat) {
      return res.status(200).json(chat);
    }

    const newChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [myId, userId]
    });

    chat = await Chat.findById(newChat._id)
      .populate("users", "name dp username");

    res.status(201).json(chat);

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const createGroupChat = async (req, res) => {
  const { name, userIds } = req.body; 
  const adminId = req.user.id;

  if (!name || !userIds || userIds.length < 1) {
    return res.status(400).json({ message: "Please provide name and users" });
  }

  try {
    const users = [...userIds, adminId];

    const groupChat = await Chat.create({
      chatName: name,
      users,
      isGroupChat: true,
      groupAdmin: adminId
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "name dp username")
      .populate("groupAdmin", "name dp username");

    res.status(201).json(fullGroupChat);

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const sendMessage = async (req, res) => {
  const { content, chatId, messageType = "text", mediaUrl } = req.body;
  const senderId = req.user.id;

  if (!content && !mediaUrl) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  try {
    let message = await Message.create({
      sender: senderId,
      chat: chatId,
      content,
      messageType,
      mediaUrl
    });

    message = await message.populate("sender", "name dp username")
      .populate("chat");

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    res.status(201).json(message);

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const fetchMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name dp username")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const markMessagesRead = async (req, res) => {
  const { chatId } = req.body;
  const userId = req.user.id;

  try {
    await Message.updateMany(
      { chat: chatId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const leaveGroupChat = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: "Cannot leave a 1-to-1 chat" });
    }

    chat.users = chat.users.filter(user => user.toString() !== userId);

    if (chat.groupAdmin.toString() === userId && chat.users.length > 0) {
      chat.groupAdmin = chat.users[0]; 
    }

    await chat.save();

    res.status(200).json({ message: "You left the group chat successfully", chat });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
