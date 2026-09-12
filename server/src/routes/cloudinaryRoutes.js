import express from 'express';
import { checkCloudinaryStatus } from '../controllers/cloudinaryController.js';

const router = express.Router();

// GET /api/cloudinary/status
router.get('/status', checkCloudinaryStatus);

export default router;
