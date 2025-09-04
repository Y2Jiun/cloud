import express from "express";
import { authenticate, authorize, ROLES } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";
import {
  createEvidence,
  getEvidenceByCase,
  getAllEvidence,
  getEvidence,
  updateEvidence,
  deleteEvidence,
} from "../controllers/evidence";

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Apply authentication to all routes
router.use(authenticate);

// Routes with role-based authorization
// All authenticated users can create evidence
router.post("/", createEvidence);

// Admin and legal officers can view all evidence
router.get("/", authorize(ROLES.ADMIN, ROLES.LEGAL_OFFICER), getAllEvidence);

// All authenticated users can view evidence by case (access controlled in controller)
router.get("/case/:caseId", getEvidenceByCase);
router.get("/:id", getEvidence);

// Users can update their own evidence, admins/legal officers can update any
router.put("/:id", updateEvidence);

// Only admins can delete evidence
router.delete("/:id", authorize(ROLES.ADMIN), deleteEvidence);

export default router;
