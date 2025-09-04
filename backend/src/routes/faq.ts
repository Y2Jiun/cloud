import express from "express";
import { authenticate } from "../middleware/auth";
import {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  markHelpful,
  getAdminFAQs,
} from "../controllers/faqController";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllFAQs);
router.get("/:id", getFAQById);
router.post("/:id/helpful", markHelpful);

// Admin routes (authentication required)
router.use(authenticate);
router.get("/admin/all", getAdminFAQs);
router.post("/", createFAQ);
router.put("/:id", updateFAQ);
router.delete("/:id", deleteFAQ);

export default router;
