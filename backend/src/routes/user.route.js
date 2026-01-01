import express from "express";
import {
  getProfile,     
  updateProfile,
  searchUsers
} from "../controllers/user.controller.js";
import {
  getAllRooms,
  requestToJoinRoom,
  leaveRoom
} from "../controllers/room.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();


router.get("/profile", auth, getProfile);

router.get("/profile/:id", auth, getProfile);
router.put("/update", auth, updateProfile);

router.get("/search", auth, searchUsers);

router.get("/rooms", auth, getAllRooms);
router.post("/rooms/:roomId/request", auth, requestToJoinRoom);
router.post("/rooms/:roomId/leave", auth, leaveRoom);

export default router;