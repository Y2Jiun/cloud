import express from "express";
import { authenticate, authorize, ROLES } from "../middleware/auth";
import {
  createNotification,
  getNotifications,
  getAllNotificationsForAdmin,
  getNotification,
  updateNotification,
  deleteNotification,
  deleteNotificationForUser,
  searchNotifications,
} from "../controllers/notifications";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Public routes (for all authenticated users)
router.get("/", getNotifications); // Get notifications based on user role
router.get("/search", searchNotifications); // Search notifications
router.get("/:id", getNotification); // Get specific notification
router.delete("/user/:id", deleteNotificationForUser); // User can delete notifications they can see

// Admin-only routes
router.post("/", authorize(ROLES.ADMIN), createNotification); // Create notification
router.get("/admin/all", authorize(ROLES.ADMIN), getAllNotificationsForAdmin); // Get all notifications for admin
router.put("/:id", authorize(ROLES.ADMIN), updateNotification); // Update notification
router.delete("/:id", authorize(ROLES.ADMIN), deleteNotification); // Delete notification

export default router;
