import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },

    phone_number: {
      type: String,
      required: true,
      unique: true
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    }
    ,
    password: {
      type: String,
      required: true,
      minlength: 6
    },

    dob: {
      type: Date
    },

    dp: {
      type: String,
      default: ""
    },

    is_active: {
      type: Boolean,
      default: true
    },

    last_seen: {
      type: Date
    },

    status: {
      type: String,
      default: "Hey there! I am using ChatApp"
    }
  },
  { timestamps: true }
);

UserSchema.index({ name: 1 });
UserSchema.index({ name: "text", phone_number: "text" });

export default mongoose.model("User", UserSchema);
