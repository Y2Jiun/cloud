import express from "express";
import { authenticate, authorize, ROLES } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";
import {
  createScamReport,
  getScamReports,
  getScamReport,
  updateScamReport,
  deleteScamReport,
  searchScamReports,
  approveScamReport,
  rejectScamReport,
} from "../controllers/scamReports";

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Apply authentication to all routes
router.use(authenticate);

// Routes with role-based authorization
// All authenticated users can create reports
router.post("/", createScamReport);

// All authenticated users can view reports (filtered by role in controller)
router.get("/", getScamReports);

// All authenticated users can search reports
router.get("/search", searchScamReports);

// All authenticated users can view individual reports (access controlled in controller)
router.get("/:id", getScamReport);

// Users can update their own reports, admins/legal officers can update any
router.put("/:id", updateScamReport);

// Users can delete their own reports, admins can delete any
router.delete("/:id", deleteScamReport);

// Admin only: approve/reject reports
router.put("/:id/approve", approveScamReport);
router.put("/:id/reject", rejectScamReport);

export default router;
