import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import { uploadProduct, getProductById, getUserProducts, regenerateAsset } from '../controllers/productController.js';

const router = express.Router();

// GET /api/products (Requires Bearer token - list all user products)
router.get('/', requireAuth, getUserProducts);

// POST /api/products/upload (Requires Bearer token & image file)
router.post('/upload', requireAuth, uploadSingleImage, uploadProduct);

// GET /api/products/:id (Requires Bearer token)
router.get('/:id', requireAuth, getProductById);

// POST /api/products/:id/regenerate-asset (Regenerate target single asset)
router.post('/:id/regenerate-asset', requireAuth, regenerateAsset);

export default router;
