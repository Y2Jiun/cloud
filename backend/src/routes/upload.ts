import express from "express";
import path from "path";
import { uploadImage, deleteImage } from "../controllers/uploadController";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

// Serve static files (no authentication required for viewing)
router.get("/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../../uploads/images", filename);
  console.log(`📁 Serving image: ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`❌ Error serving image: ${err.message}`);
      if (!res.headersSent) {
        res.status(404).json({ error: "Image not found" });
      }
    }
  });
});

router.get("/evidence/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../../uploads/evidence", filename);
  console.log(`📁 Serving evidence: ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`❌ Error serving evidence: ${err.message}`);
      if (!res.headersSent) {
        res.status(404).json({ error: "Evidence not found" });
      }
    }
  });
});

router.get("/profiles/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../../uploads/profiles", filename);
  console.log(`📁 Serving profile: ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`❌ Error serving profile: ${err.message}`);
      if (!res.headersSent) {
        res.status(404).json({ error: "Profile image not found" });
      }
    }
  });
});

// Upload routes require authentication
router.use(authenticate);

router.post("/image", upload.single("image"), uploadImage);
router.delete("/image/:filename", deleteImage);

export default router;
