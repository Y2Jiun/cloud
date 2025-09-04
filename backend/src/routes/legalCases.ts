import express from "express";
import {
  createLegalCase,
  getLegalCases,
  getLegalCase,
  updateLegalCase,
  deleteLegalCase,
  approveLegalCase,
  rejectLegalCase,
  uploadDocument,
  downloadDocument,
  getCaseDocuments,
} from "../controllers/legalCases";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Legal case CRUD operations
router.post("/", createLegalCase);
router.get("/", getLegalCases);
router.get("/:id", getLegalCase);
router.put("/:id", updateLegalCase);
router.delete("/:id", deleteLegalCase);

// Admin approval routes
router.patch("/:id/approve", approveLegalCase);
router.patch("/:id/reject", rejectLegalCase);

// Document management routes
router.post("/:id/documents", upload.single("document"), uploadDocument);
router.get("/:id/documents", getCaseDocuments);
router.get("/documents/:documentId/download", downloadDocument);

export default router;
