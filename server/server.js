// server.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import { setupSocket } from "./socket.js";

// routes
import problemRoutes from "./routes/problemRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const server = http.createServer(app);
const io = setupSocket(server);

// ✅ Attach req.io BEFORE routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Now mount routes
app.use("/api/problems", problemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/auth", authRoutes);

// DB + server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));