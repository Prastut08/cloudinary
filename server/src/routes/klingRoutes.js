import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import {
  generateImageToVideo,
  getLumaTaskStatus,
  getLumaHistory,
} from '../controllers/lumaController.js';

const router = express.Router();

// Backward compatibility routes for /api/kling -> Luma AI engine
router.post('/generate', requireAuth, uploadSingleImage, generateImageToVideo);
router.get('/task/:taskId', requireAuth, getLumaTaskStatus);
router.get('/history', requireAuth, getLumaHistory);

export default router;
