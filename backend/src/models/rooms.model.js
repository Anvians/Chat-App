import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    room_icon: {
      type: String,
      trim: true
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    isPrivate: {
      type: Boolean,
      default: true 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Room", RoomSchema);
