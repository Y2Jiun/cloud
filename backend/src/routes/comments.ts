import express from "express";
import { authenticate, authorize, ROLES } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";
import {
  createComment,
  getCommentsByAlert,
  getAllComments,
  updateComment,
  deleteComment,
  approveComment,
  rejectComment,
} from "../controllers/comments";

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Apply authentication to all routes
router.use(authenticate);

// Routes with role-based authorization
// All authenticated users can create comments
router.post("/", createComment);

// Admin only - for moderation
router.get("/", authorize(ROLES.ADMIN), getAllComments);

// All authenticated users can view comments by alert
router.get("/alert/:alertId", getCommentsByAlert);

// Users can update/delete their own comments, admins can update/delete any
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

// Admin only - comment moderation
router.patch("/:id/approve", authorize(ROLES.ADMIN), approveComment);
router.patch("/:id/reject", authorize(ROLES.ADMIN), rejectComment);

export default router;
