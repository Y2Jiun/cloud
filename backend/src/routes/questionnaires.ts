import express from "express";
import { authenticate } from "../middleware/auth";
import {
  createQuestionnaire,
  getMyQuestionnaires,
  getQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  toggleQuestionnaireStatus,
  getActiveQuestionnaires,
  submitQuestionnaireResponse,
  exportResponsesCSV,
  exportResponsesPDF,
} from "../controllers/questionnaires";

const router = express.Router();

// Legal Officer routes (require authentication and role 2)
router.use(authenticate);

// Create questionnaire (Legal Officer only)
router.post("/", createQuestionnaire);

// Get my questionnaires (Legal Officer only)
router.get("/my", getMyQuestionnaires);

// Public routes (require authentication but no specific role)
// IMPORTANT: Define static paths BEFORE dynamic ":id" to avoid shadowing (e.g., "/active").
router.get("/active", getActiveQuestionnaires);
router.post("/:id/respond", submitQuestionnaireResponse);

// Get specific questionnaire
router.get("/:id", getQuestionnaire);

// Update questionnaire (Legal Officer only)
router.put("/:id", updateQuestionnaire);

// Delete questionnaire (Legal Officer only)
router.delete("/:id", deleteQuestionnaire);

// Toggle questionnaire status (Legal Officer only)
router.patch("/:id/status", toggleQuestionnaireStatus);

// Export responses (Legal Officer only)
router.get("/:id/export/csv", exportResponsesCSV);
router.get("/:id/export/pdf", exportResponsesPDF);

export default router;
