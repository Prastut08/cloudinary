import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import {
  generateImageToVideo,
  getLumaTaskStatus,
  getLumaHistory,
} from '../controllers/lumaController.js';

const router = express.Router();

// POST /api/luma/generate (Requires Bearer token & image file/URL)
router.post('/generate', requireAuth, uploadSingleImage, generateImageToVideo);

// GET /api/luma/task/:taskId (Requires Bearer token - check task status)
router.get('/task/:taskId', requireAuth, getLumaTaskStatus);

// GET /api/luma/history (Requires Bearer token - list Luma video history)
router.get('/history', requireAuth, getLumaHistory);

export default router;
