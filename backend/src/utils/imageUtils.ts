import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (this should be called once at app startup)
export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Validate image file
export const validateImageFile = (file: Express.Multer.File): { isValid: boolean; error?: string } => {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 5MB limit' };
  }

  // Check MIME type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return { isValid: false, error: 'Invalid file type. Only images are allowed.' };
  }

  return { isValid: true };
};

// Upload image to Cloudinary
export const uploadToCloudinary = async (
  file: Express.Multer.File,
  options: {
    folder?: string;
    width?: number;
    height?: number;
    quality?: string;
  } = {}
): Promise<{
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
}> => {
  const {
    folder = 'dashboard-app',
    width = 800,
    height = 600,
    quality = 'auto'
  } = options;

  // Convert buffer to base64
  const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  // Upload to Cloudinary
  const uploadResponse = await cloudinary.uploader.upload(fileStr, {
    folder,
    resource_type: 'image',
    transformation: [
      { width, height, crop: 'limit' },
      { quality },
      { fetch_format: 'auto' }
    ]
  });

  return {
    url: uploadResponse.secure_url,
    publicId: uploadResponse.public_id,
    format: uploadResponse.format,
    width: uploadResponse.width,
    height: uploadResponse.height
  };
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

// Generate optimized image URL
export const generateOptimizedUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
  } = {}
): string => {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  let transformation = `q_${quality},f_${format}`;
  
  if (width && height) {
    transformation += `,w_${width},h_${height},c_${crop}`;
  } else if (width) {
    transformation += `,w_${width}`;
  } else if (height) {
    transformation += `,h_${height}`;
  }

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
};

// Get image info from Cloudinary
export const getImageInfo = async (publicId: string) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      url: result.secure_url,
      createdAt: result.created_at
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    return null;
  }
};

// Batch delete images
export const batchDeleteFromCloudinary = async (publicIds: string[]): Promise<{
  deleted: string[];
  failed: string[];
}> => {
  const deleted: string[] = [];
  const failed: string[] = [];

  for (const publicId of publicIds) {
    const success = await deleteFromCloudinary(publicId);
    if (success) {
      deleted.push(publicId);
    } else {
      failed.push(publicId);
    }
  }

  return { deleted, failed };
};
