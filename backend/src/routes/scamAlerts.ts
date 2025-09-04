import express from "express";
import { authenticate } from "../middleware/auth";
import {
  createScamAlert,
  getScamAlerts,
  getScamAlertById,
  updateScamAlert,
  approveScamAlert,
  rejectScamAlert,
  deleteScamAlert,
  toggleAlertStatus,
} from "../controllers/scamAlertController";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// CRUD operations
router.post("/", createScamAlert);
router.get("/", getScamAlerts);
router.get("/:id", getScamAlertById);
router.put("/:id", updateScamAlert);
router.delete("/:id", deleteScamAlert);

// Admin approval operations
router.put("/:id/approve", approveScamAlert);
router.put("/:id/reject", rejectScamAlert);
router.put("/:id/toggle-status", toggleAlertStatus);

export default router;
