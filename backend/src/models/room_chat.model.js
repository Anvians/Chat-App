import mongoose from "mongoose";

const RoomMessageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    content: {
      type: String,
      trim: true
    },

    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text"
    }
  },
  { timestamps: true }
);

export default mongoose.model("RoomMessage", RoomMessageSchema);
