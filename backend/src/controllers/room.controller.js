import Room from '../models/rooms.model.js';
import RoomRequest from '../models/room_join.model.js';
import RoomMessage from "../models/room_chat.model.js";
export const createRoom = async (req, res) => {
    const { name, description, isPrivate, room_icon } = req.body;
    const adminId = req.user.id;

    try {
        const newRoom = new Room({
            name,
            description,
            isPrivate: isPrivate || false,
            room_icon: room_icon || "", 
            admin: adminId,
            members: [adminId] 
        });

        await newRoom.save();
        res.status(201).json({ message: 'Room created successfully', room: newRoom });
    } catch (e) {
        res.status(500).json({ message: 'Server error', error: e.message });
    }
};

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate("admin", "name username")
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyRooms = async (req, res) => {
  try {
    const myRooms = await Room.find({ members: req.user.id })
      .populate('admin', 'name phone_number');
    res.json(myRooms);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.isPrivate) return res.status(403).json({ message: "This room is private. Send a request instead." });
    if (room.members.includes(req.user.id)) return res.status(400).json({ message: "Already a member" });

    room.members.push(req.user.id);
    await room.save();
    res.json({ message: "Joined successfully", room });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

export const requestToJoinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.members.includes(req.user.id)) return res.status(400).json({ message: "Already in room" });

    const existingRequest = await RoomRequest.findOne({ room: roomId, user: req.user.id });
    if (existingRequest) return res.status(400).json({ message: `Request is ${existingRequest.status}` });

    const request = await RoomRequest.create({ room: roomId, user: req.user.id });
    res.status(201).json({ message: "Join request sent", request });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    room.members = room.members.filter(m => m.toString() !== req.user.id);
    await room.save();
    res.json({ message: "Left room successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (room.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only admins can view requests" });
    }

    const requests = await RoomRequest.find({ room: roomId, status: "pending" })
      .populate("user", "name phone_number dp");
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};

export const handleJoinRequest = async (req, res) => {
  const { requestId, action } = req.body; 
  
  try {
    const request = await RoomRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const room = await Room.findById(request.room);
    if (room.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (action === "approved") {
      request.status = "approved";
      if (!room.members.includes(request.user)) {
        room.members.push(request.user);
        await room.save();
      }
    } else {
      request.status = "rejected";
    }

    await request.save();
    res.json({ message: `Request ${action} successfully` });
  } catch (err) {
    res.status(500).json({ message: "Error handling request" });
  }
};

export const getRoomMessages = async (req, res) => {
  const { roomId } = req.params;
  try {
    const messages = await RoomMessage.find({ room: roomId })
      .populate("sender", "name dp")
      .sort({ createdAt: 1 }); 
      
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};


