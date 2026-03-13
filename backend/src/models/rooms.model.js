import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    room_icon: {
      type: String,
      trim: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // which queries { isPrivate: false }. Previously defaulting to true
    // caused all rooms to be hidden from the discovery page unless
    // the creator explicitly passed isPrivate: false in the request body.
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Room", RoomSchema);