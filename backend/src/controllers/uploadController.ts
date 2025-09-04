import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  validateImageFile,
  uploadToLocal,
  deleteFromLocal,
  ensureUploadDirs,
  uploadFromUrl,
} from "../utils/imageUtils";

// Ensure upload directories exist
ensureUploadDirs();

export const uploadImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { folder, imageUrl } = req.body;

    // Handle URL upload
    if (imageUrl) {
      const uploadResult = await uploadFromUrl(imageUrl, {
        folder: folder as "images" | "evidence" | "profiles",
      });

      if (!uploadResult) {
        res.status(400).json({
          success: false,
          error: "Failed to upload image from URL",
        });
        return;
      }

      res.json({
        success: true,
        data: uploadResult,
      });
      return;
    }

    // Handle file upload
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "No file uploaded or URL provided",
      });
      return;
    }

    // Validate file
    const validation = validateImageFile(req.file);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error,
      });
      return;
    }

    // Upload to local storage
    const uploadResult = await uploadToLocal(req.file, {
      folder: folder as "images" | "evidence" | "profiles",
    });

    res.json({
      success: true,
      data: uploadResult,
    });
  } catch (error) {
    console.error("Upload image error:", error);
    res.status(500).json({
      success: false,
      error: "Server error uploading image",
    });
  }
};

export const deleteImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { filename } = req.params;
    const { folder } = req.query;

    if (!filename) {
      res.status(400).json({
        success: false,
        error: "Filename is required",
      });
      return;
    }

    // Delete from local storage
    const success = await deleteFromLocal(
      filename,
      folder as "images" | "evidence" | "profiles"
    );

    if (success) {
      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Failed to delete image or file not found",
      });
    }
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      success: false,
      error: "Server error deleting image",
    });
  }
};
