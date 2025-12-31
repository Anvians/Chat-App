import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true
    },

    content: {
      type: String,
      trim: true
    },

    messageType: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text"
    },

    mediaUrl: {
      type: String
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
