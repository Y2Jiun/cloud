import express from "express";
import { authenticate } from "../middleware/auth";
import {
  getRoleChangeStatus,
  createRoleChangeRequest,
  getAllRoleChangeRequests,
  approveRoleChangeRequest,
  rejectRoleChangeRequest,
} from "../controllers/roleChangeController";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get current user's role change request status
router.get("/status", getRoleChangeStatus);

// Create new role change request
router.post("/", createRoleChangeRequest);

// Admin routes
router.get("/", getAllRoleChangeRequests);
router.put("/:id/approve", approveRoleChangeRequest);
router.put("/:id/reject", rejectRoleChangeRequest);

export default router;
