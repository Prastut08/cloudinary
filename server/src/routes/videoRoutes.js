import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadSingleVideo } from '../middleware/uploadMiddleware.js';
import {
  uploadVideo,
  getVideoById,
  generateVariantsForVideo,
} from '../controllers/videoController.js';

const router = express.Router();

// POST /api/videos/upload (Requires Bearer token & video file)
router.post('/upload', requireAuth, uploadSingleVideo, uploadVideo);

// GET /api/videos/:id (Requires Bearer token)
router.get('/:id', requireAuth, getVideoById);

// POST /api/videos/:id/variants (Requires Bearer token - generate/re-derive variants)
router.post('/:id/variants', requireAuth, generateVariantsForVideo);

export default router;
