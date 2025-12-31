import express from "express";
import {
    createRoom,
    getMyRooms,
    getAllRooms,
    joinRoom,
    requestToJoinRoom,
    leaveRoom,
    getPendingRequests,
    handleJoinRequest,
    getRoomMessages
} from "../controllers/room.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(auth);

router.post("/create", createRoom);          // Admin: Create new group
router.get("/my", getMyRooms);               // List of rooms I am a member of
router.get("/discover", getAllRooms);        // Public rooms available to join
router.post("/:roomId/join", joinRoom);      // Direct join (Public)
router.post("/:roomId/request", requestToJoinRoom); // Join request (Private)
router.post("/:roomId/leave", leaveRoom);    // Exit group
router.get("/:roomId/requests", auth, getPendingRequests);
router.post("/request/handle", auth, handleJoinRequest);
router.get("/:roomId/messages", auth, getRoomMessages);

export default router;