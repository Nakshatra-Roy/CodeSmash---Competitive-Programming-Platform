import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { userSockets } from "../socket.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const register = async (req, res) => {
  try {
    const { username, password, email, name, dateOfBirth } = req.body;

    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: "Username already taken! Choose an unique one." });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashed,
      email,
      name,
      dateOfBirth
    });

    res.status(201).json({ message: "Registration successful", user: { username, email } });
  } catch (err) {
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(401).json({ error: "Incorrect username or password." });
    if (user.accountStatus === "inactive") {
      return res.status(403).json({ error: "Account deactivated. Contact support." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Incorrect username or password." });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userId = user._id.toString();
    if (req.io && req.sessionID) {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(req.sessionID);
      console.log(`✅ Linked socket ${req.sessionID} to user ${userId}`);
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

export const logout = (req, res) => {
  const token = req.cookies?.token;
  let userId;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id?.toString();
    } catch (err) {
      console.log("⚠️ Invalid/expired token on logout, skipping userId");
    }
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  if (userId && req.io && userSockets.has(userId)) {
    for (const socketId of userSockets.get(userId)) {
      req.io.sockets.sockets.get(socketId)?.disconnect(true);
    }
    userSockets.delete(userId);
    console.log(`🔌 Disconnected sockets for user ${userId}`);
  } else {
    console.log("🔎 Logout request:", {
      userId,
      hasIo: !!req.io,
      hasSockets: !!(userId && userSockets.has(userId)),
    });
  }

  return res.json({ message: "Logged out" });
};

export const currentUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No session found" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const updateUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No session found" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.id !== req.params.id) {
      return res.status(403).json({ error: "You can only update your own profile" });
    }

    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
      select: "-password"
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};