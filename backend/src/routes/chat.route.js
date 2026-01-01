import express from "express";
import {auth} from "../middleware/auth.middleware.js";
import {
  accessChat,
  createGroupChat,
  sendMessage,
  fetchMessages,
  markMessagesRead,
  leaveGroupChat
} from "../controllers/chat.controller.js";
import { getMySidebarChats } from "../controllers/sidebar.controller.js";

const router = express.Router();

router.get("/sidebar", auth, getMySidebarChats);
router.post("/", auth, accessChat);
router.post("/group", auth, createGroupChat);
router.post("/message", auth, sendMessage);
router.get("/messages/:chatId", auth, fetchMessages);
router.post("/messages/read", auth, markMessagesRead);
router.post("/group/:chatId/leave", auth, leaveGroupChat);

export default router;
