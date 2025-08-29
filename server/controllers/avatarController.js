import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET;

export const updateAvatar = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No session found" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.id !== req.params.id) {
      return res.status(403).json({ error: "You can only update your own avatar" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: avatarUrl },
      { new: true, runValidators: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Avatar updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("Avatar update error:", err);
    res.status(500).json({ error: "Avatar update failed" });
  }
};