import express from "express";
import { register, login, logout, currentUser, updateUser } from "../controllers/authController.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireLogin, logout);
router.put("/profile/:id", updateUser);
router.get("/profile", currentUser);

export default router;