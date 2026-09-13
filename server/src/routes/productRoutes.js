import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import {
  uploadProduct,
  getProductById,
  getUserProducts,
  regenerateAsset,
  searchUserAssets,
  updateProduct,
  deleteProduct,
  createProductShare,
  toggleProductShare,
  deleteSingleAsset,
  getPublicShare,
  downloadProductZip,
} from '../controllers/productController.js';

const router = express.Router();

// GET /api/products (Requires Bearer token - list all user products)
router.get('/', requireAuth, getUserProducts);

// GET /api/products/assets/search (Requires Bearer token - Search Cloudinary assets + Firestore metadata)
router.get('/assets/search', requireAuth, searchUserAssets);

// POST /api/products/upload (Requires Bearer token & image file)
router.post('/upload', requireAuth, uploadSingleImage, uploadProduct);

// GET /api/products/share/:shareToken (Public endpoint to resolve share token)
router.get('/share/:shareToken', getPublicShare);

// GET /api/products/:id (Requires Bearer token)
router.get('/:id', requireAuth, getProductById);

// GET /api/products/:id/download (Requires Bearer token - Download ZIP archive of all assets)
router.get('/:id/download', requireAuth, downloadProductZip);

// PATCH /api/products/:id (Requires Bearer token - Rename product)
router.patch('/:id', requireAuth, updateProduct);

// DELETE /api/products/:id (Requires Bearer token - Delete product and Cloudinary folder assets)
router.delete('/:id', requireAuth, deleteProduct);

// POST /api/products/:id/share (Requires Bearer token - Create or get share token for product)
router.post('/:id/share', requireAuth, createProductShare);

// POST /api/products/:id/share/toggle (Requires Bearer token - Enable/disable sharing)
router.post('/:id/share/toggle', requireAuth, toggleProductShare);

// POST /api/products/:id/regenerate-asset (Regenerate target single asset)
router.post('/:id/regenerate-asset', requireAuth, regenerateAsset);

// DELETE /api/products/:id/assets/:variantKey (Requires Bearer token - Delete individual asset variant)
router.delete('/:id/assets/:variantKey', requireAuth, deleteSingleAsset);

export default router;
