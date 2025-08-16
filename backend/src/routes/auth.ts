import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithToken,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Password reset routes (public)
router.post("/send-reset-otp", sendPasswordResetOtp);
router.post("/verify-reset-otp", verifyPasswordResetOtp);
router.post("/reset-password-with-token", resetPasswordWithToken);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
