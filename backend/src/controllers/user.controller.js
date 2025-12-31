import User from "../models/user.model.js";

export const getProfile = async (req, res) => {
  try {
    const targetId = req.params.id || req.user.id;

    const user = await User.findById(targetId).select("-__v -password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isOwnProfile = targetId.toString() === req.user.id.toString();

    res.status(200).json({ user, isOwnProfile });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, status, dp, dob, email } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, status, dp, dob, email },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user: updatedUser });
  } catch (e) {
    res.status(500).json({ message: "Update failed", error: e.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json([]);

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { phone_number: { $regex: query, $options: "i" } }
      ],
      _id: { $ne: req.user.id } 
    })
    .select("name dp phone_number status") 
    .limit(10);

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("name username dp last_seen status");
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLastSeen = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, { last_seen: new Date() });
  } catch (err) {
    console.error("Failed to update last seen:", err);
  }
};