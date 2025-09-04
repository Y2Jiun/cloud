import express from "express";
import { authenticate, authorize, ROLES } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";
import {
  getAllUsersWithRoles,
  updateUserRole,
  getRoleStatistics,
  getCurrentUserRole,
} from "../controllers/roles";

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Apply authentication to all routes
router.use(authenticate);

// Routes
// Get current user's role info (all authenticated users)
router.get("/me", getCurrentUserRole);

// Get all users with roles (Admin only)
router.get("/users", authorize(ROLES.ADMIN), getAllUsersWithRoles);

// Update user role (Admin only)
router.put("/users/:userId", authorize(ROLES.ADMIN), updateUserRole);

// Get role statistics (Admin only)
router.get("/statistics", authorize(ROLES.ADMIN), getRoleStatistics);

export default router;
