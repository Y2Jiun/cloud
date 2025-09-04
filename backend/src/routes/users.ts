import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { authenticate, authorize, ROLES } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// All user routes require authentication
router.use(authenticate);

// Admin-only routes for user management
router.get("/", authorize(ROLES.ADMIN), getUsers);
router.get("/:id", authorize(ROLES.ADMIN), getUserById);
router.put("/:id", authorize(ROLES.ADMIN), updateUser);
router.delete("/:id", authorize(ROLES.ADMIN), deleteUser);

export default router;
