import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    isGroupChat: {
      type: Boolean,
      default: false
    },

    chatName: {
      type: String,
      trim: true
    },

    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Chat", ChatSchema);
