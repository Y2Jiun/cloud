import express from "express";
import { authenticate } from "../middleware/auth";
import {
  createChecklist,
  getChecklists,
  updateChecklist,
  deleteChecklist,
  addItem,
  updateItem,
  deleteItem,
} from "../controllers/checklists";

const router = express.Router();

router.use(authenticate);

// User-only checklists
router.post("/", createChecklist);
router.get("/", getChecklists);
router.put("/:id", updateChecklist);
router.delete("/:id", deleteChecklist);

// Items
router.post("/:checklistId/items", addItem);
router.put("/items/:itemId", updateItem);
router.delete("/items/:itemId", deleteItem);

export default router;




