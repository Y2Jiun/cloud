import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  validateImageFile,
  uploadToCloudinary,
  deleteFromCloudinary,
  configureCloudinary,
} from "../utils/imageUtils";

// Configure Cloudinary
configureCloudinary();

export const uploadImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "No file uploaded",
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

    // Upload to Cloudinary using utility function
    const uploadResult = await uploadToCloudinary(req.file);

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
    const { publicId } = req.params;

    if (!publicId) {
      res.status(400).json({
        success: false,
        error: "Public ID is required",
      });
      return;
    }

    // Delete from Cloudinary using utility function
    const success = await deleteFromCloudinary(publicId);

    if (success) {
      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Failed to delete image",
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
