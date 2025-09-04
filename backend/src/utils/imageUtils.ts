import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Configure local storage paths
const UPLOAD_DIR = path.join(__dirname, "../../uploads");
const IMAGES_DIR = path.join(UPLOAD_DIR, "images");
const EVIDENCE_DIR = path.join(UPLOAD_DIR, "evidence");
const PROFILES_DIR = path.join(UPLOAD_DIR, "profiles");

// Ensure upload directories exist
export const ensureUploadDirs = () => {
  [UPLOAD_DIR, IMAGES_DIR, EVIDENCE_DIR, PROFILES_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Get upload directory path
export const getUploadDir = (
  folder: "images" | "evidence" | "profiles" = "images"
): string => {
  switch (folder) {
    case "evidence":
      return EVIDENCE_DIR;
    case "profiles":
      return PROFILES_DIR;
    default:
      return IMAGES_DIR;
  }
};

// Validate image file
export const validateImageFile = (
  file: Express.Multer.File
): { isValid: boolean; error?: string } => {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: "No file provided" };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: "File size exceeds 5MB limit" };
  }

  // Check MIME type - REMOVED SVG support for security
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error:
        "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
    };
  }

  return { isValid: true };
};

// Upload image to local storage
export const uploadToLocal = async (
  file: Express.Multer.File,
  options: {
    folder?: "images" | "evidence" | "profiles";
  } = {}
): Promise<{
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  path: string;
}> => {
  const { folder = "images" } = options;

  // Ensure directories exist
  ensureUploadDirs();

  // Generate unique filename
  const fileExtension = path.extname(file.originalname);
  const filename = `${uuidv4()}${fileExtension}`;

  // Get upload directory
  const uploadDir = getUploadDir(folder);
  const filePath = path.join(uploadDir, filename);

  // Save file to local storage
  fs.writeFileSync(filePath, file.buffer);

  // Generate URL for accessing the file
  const url = `/api/uploads/${folder}/${filename}`;

  return {
    url,
    filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    path: filePath,
  };
};

// Delete image from local storage
export const deleteFromLocal = async (
  filename: string,
  folder: "images" | "evidence" | "profiles" = "images"
): Promise<boolean> => {
  try {
    const uploadDir = getUploadDir(folder);
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting image from local storage:", error);
    return false;
  }
};

// Generate local image URL
export const generateLocalUrl = (
  filename: string,
  folder: "images" | "evidence" | "profiles" = "images"
): string => {
  return `/api/uploads/${folder}/${filename}`;
};

// Get local image info
export const getLocalImageInfo = async (
  filename: string,
  folder: "images" | "evidence" | "profiles" = "images"
) => {
  try {
    const uploadDir = getUploadDir(folder);
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stats = fs.statSync(filePath);
    const fileExtension = path.extname(filename);

    return {
      filename,
      originalPath: filePath,
      size: stats.size,
      format: fileExtension.slice(1), // Remove the dot
      url: generateLocalUrl(filename, folder),
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
  } catch (error) {
    console.error("Error getting local image info:", error);
    return null;
  }
};

// Batch delete local images
export const batchDeleteFromLocal = async (
  filenames: string[],
  folder: "images" | "evidence" | "profiles" = "images"
): Promise<{
  deleted: string[];
  failed: string[];
}> => {
  const deleted: string[] = [];
  const failed: string[] = [];

  for (const filename of filenames) {
    const success = await deleteFromLocal(filename, folder);
    if (success) {
      deleted.push(filename);
    } else {
      failed.push(filename);
    }
  }

  return { deleted, failed };
};

// Upload image from URL (for your requirement)
export const uploadFromUrl = async (
  imageUrl: string,
  options: {
    folder?: "images" | "evidence" | "profiles";
    filename?: string;
  } = {}
): Promise<{
  url: string;
  filename: string;
  size: number;
  mimetype: string;
} | null> => {
  try {
    const { folder = "images", filename } = options;

    // Fetch image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Generate filename if not provided
    const fileExtension = contentType.split("/")[1] || "jpg";
    const finalFilename = filename || `${uuidv4()}.${fileExtension}`;

    // Ensure directories exist
    ensureUploadDirs();

    // Get upload directory and save file
    const uploadDir = getUploadDir(folder);
    const filePath = path.join(uploadDir, finalFilename);

    fs.writeFileSync(filePath, buffer);

    return {
      url: generateLocalUrl(finalFilename, folder),
      filename: finalFilename,
      size: buffer.length,
      mimetype: contentType,
    };
  } catch (error) {
    console.error("Error uploading from URL:", error);
    return null;
  }
};
