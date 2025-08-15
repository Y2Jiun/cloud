import express from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// All upload routes require authentication
router.use(authenticate);

router.post('/image', upload.single('image'), uploadImage);
router.delete('/image/:publicId', deleteImage);

export default router;
