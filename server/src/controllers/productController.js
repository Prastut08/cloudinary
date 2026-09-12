import {
  uploadBufferToCloudinary,
  getTransparentBgUrl,
  getSmartCropUrl,
  generatePlatformVariants,
  regenerateSingleAssetUrl,
  calculateCommerceReadiness,
} from '../services/cloudinaryService.js';
import { adminDb } from '../config/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

// Memory cache store for instant retrieval
const memoryProductStore = new Map();

/**
 * GET /api/products
 * Fetch all user-owned products from Firestore & memory cache
 */
export const getUserProducts = async (req, res, next) => {
  try {
    const { uid } = req.user;

    let products = [];
    try {
      const snapshot = await adminDb.collection('products').where('userId', '==', uid).get();

      snapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        });
      });
    } catch (fsErr) {
      console.warn('[FIRESTORE READ WARNING]:', fsErr.message);
    }

    memoryProductStore.forEach((item, id) => {
      if (item.userId === uid && !products.some((p) => p.id === id)) {
        products.unshift({ id, ...item });
      }
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products/upload
 * Full Product Media Intelligence Pipeline Orchestration
 */
export const uploadProduct = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { name, category } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Validation', message: 'Product name is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Validation', message: 'Product image file is required.' });
    }

    const productId = `prod_${crypto.randomBytes(8).toString('hex')}`;
    const folderPath = `products/${uid}/${productId}`;

    // 1. Cloudinary Ingestion & Media Analysis
    let uploadResult;
    let pipelineNotes = [];

    try {
      uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: folderPath,
        public_id: 'original',
        resource_type: 'image',
      });
    } catch (err) {
      console.error('[CLOUDINARY UPLOAD ERROR]:', err);
      return res.status(502).json({
        error: 'CloudinaryError',
        message: 'Failed to ingest and upload image to Cloudinary.',
        details: err.message,
      });
    }

    // 2. Extract Real AI Signals from Cloudinary Payload
    // AI Tags
    let extractedTags = [];
    if (uploadResult.tags && Array.isArray(uploadResult.tags) && uploadResult.tags.length > 0) {
      extractedTags = uploadResult.tags.map((t) => ({ name: t, confidence: null }));
    } else if (uploadResult.info?.categorization?.google_tagging?.data) {
      extractedTags = uploadResult.info.categorization.google_tagging.data.map((item) => ({
        name: item.tag,
        confidence: item.confidence,
      }));
    } else {
      pipelineNotes.push('AI Auto-Tagging add-on disabled on Cloudinary account.');
    }

    // AI Captioning
    let caption = null;
    if (uploadResult.accessibility_analysis?.caption) {
      caption = uploadResult.accessibility_analysis.caption;
    } else {
      pipelineNotes.push('AI Image Captioning add-on disabled on Cloudinary account.');
    }

    // Image Quality Analysis
    let qualityScore = null;
    let qualityRating = 'Good';
    if (uploadResult.quality_analysis?.focus !== undefined) {
      qualityScore = Math.round(uploadResult.quality_analysis.focus * 100);
      if (qualityScore >= 85) qualityRating = 'Excellent';
      else if (qualityScore < 60) qualityRating = 'Needs improvement';
    } else {
      pipelineNotes.push('Image Quality Analysis unavailable on standard upload.');
    }

    // Watermark Detection
    let watermarkDetected = false;
    let watermarkStatus = 'None detected';
    if (uploadResult.watermark !== undefined) {
      watermarkDetected = Boolean(uploadResult.watermark);
      watermarkStatus = watermarkDetected ? 'Watermark detected' : 'None detected';
    } else {
      pipelineNotes.push('Watermark detection add-on unavailable.');
    }

    // Product/Studio Classification
    let imageType = 'Product / Studio';
    if (uploadResult.info?.shop_classifier) {
      imageType = uploadResult.info.shop_classifier.is_product ? 'Product / Studio' : 'Lifestyle / Natural';
    }

    // Dominant Color Analysis
    let dominantColors = [];
    if (uploadResult.colors && Array.isArray(uploadResult.colors)) {
      dominantColors = uploadResult.colors.slice(0, 4).map((c) => c[0]);
    }

    // Moderation Status
    const moderationStatus = uploadResult.moderation && uploadResult.moderation.length > 0
      ? uploadResult.moderation[0].status
      : 'unavailable';

    // 3. Generate Cloudinary Transformations & Platform Asset Packs
    const transparentUrl = getTransparentBgUrl(uploadResult.public_id);
    const squareCropUrl = getSmartCropUrl(uploadResult.public_id, 1000, 1000, 'fill');
    const portraitCropUrl = getSmartCropUrl(uploadResult.public_id, 1080, 1350, 'fill');
    const landscapeCropUrl = getSmartCropUrl(uploadResult.public_id, 1920, 600, 'fill');

    const generatedVariants = generatePlatformVariants(uploadResult.public_id);

    const assetPacks = {
      ecommerce: [
        { type: 'transparent-product', platform: 'E-commerce', title: 'Transparent Cutout', url: transparentUrl, publicId: uploadResult.public_id, format: 'png', specs: 'Dynamic PNG Cutout' },
        { type: 'square-crop', platform: 'Marketplace', title: 'Product Square', url: generatedVariants.marketplaceSquare, publicId: uploadResult.public_id, format: 'jpg', specs: '1000 × 1000 (Gravity Auto)' },
        { type: 'thumbnail', platform: 'Store Catalog', title: 'Product Thumbnail', url: generatedVariants.productThumbnail, publicId: uploadResult.public_id, format: 'webp', specs: '300 × 300 (Smart Crop)' },
        { type: 'high-res', platform: 'High-Res Studio', title: 'High-Res Asset', url: generatedVariants.highResProduct, publicId: uploadResult.public_id, format: 'jpg', specs: '1600 × 1600 Fit' },
      ],
      social: [
        { type: 'social-square', platform: 'Instagram', title: 'Social Square Feed', url: generatedVariants.socialSquare, publicId: uploadResult.public_id, format: 'jpg', specs: '1080 × 1080 (1:1 Feed)' },
        { type: 'portrait-social', platform: 'Instagram / Pinterest', title: 'Portrait Social Post', url: generatedVariants.portraitSocial, publicId: uploadResult.public_id, format: 'jpg', specs: '1080 × 1350 (4:5 Portrait)' },
        { type: 'story-vertical', platform: 'Instagram Story / TikTok', title: 'Story Vertical Banner', url: generatedVariants.storyVertical, publicId: uploadResult.public_id, format: 'jpg', specs: '1080 × 1920 (9:16 Vertical)' },
      ],
      web: [
        { type: 'website-card', platform: 'Website', title: 'Product Card Asset', url: generatedVariants.websiteProductCard, publicId: uploadResult.public_id, format: 'webp', specs: '800 × 600 Card' },
        { type: 'website-banner', platform: 'Website Widescreen', title: 'Desktop Banner', url: generatedVariants.websiteLandscape, publicId: uploadResult.public_id, format: 'webp', specs: '1920 × 600 Banner' },
        { type: 'mobile-asset', platform: 'Mobile App', title: 'Mobile App Asset', url: generatedVariants.mobileProductAsset, publicId: uploadResult.public_id, format: 'webp', specs: '600 × 450 Responsive' },
      ],
    };

    // 4. Calculate Application-Level Commerce Readiness
    const readiness = calculateCommerceReadiness({
      qualityScore,
      watermark: watermarkDetected,
      isProductStudio: imageType === 'Product / Studio',
      hasTransparentBg: true,
      hasCrops: true,
    });

    // 5. Construct Structured Product Document
    const productDoc = {
      userId: uid,
      name: name.trim(),
      category: category || 'Uncategorized',

      originalAsset: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      },

      analysis: {
        tags: extractedTags,
        caption: caption,
        qualityScore: qualityScore,
        qualityRating: qualityRating,
        watermarkStatus: watermarkStatus,
        watermarkDetected: watermarkDetected,
        imageType: imageType,
        dominantColors: dominantColors,
        moderationStatus: moderationStatus,
        commerceReadiness: readiness,
      },

      crops: {
        square: squareCropUrl,
        portrait: portraitCropUrl,
        landscape: landscapeCropUrl,
      },

      processingStatus: pipelineNotes.length > 0 ? 'completed_with_notices' : 'completed',
      processingNotes: pipelineNotes,
      assets: assetPacks,

      createdAt: new Date().toISOString(),
    };

    // Cache in memory store
    memoryProductStore.set(productId, productDoc);

    // Persist to Firestore asynchronously
    adminDb.collection('products').doc(productId).set({
      ...productDoc,
      createdAt: FieldValue.serverTimestamp(),
    }).catch((fsErr) => {
      console.warn('[FIRESTORE WRITE NOTICE]: Database write deferred, payload memory cached.', fsErr.message);
    });

    res.status(201).json({
      success: true,
      productId: productId,
      data: {
        id: productId,
        ...productDoc,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Retrieve product document by ID with user verification
 */
export const getProductById = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    if (memoryProductStore.has(id)) {
      const memoryData = memoryProductStore.get(id);
      if (memoryData.userId === uid) {
        return res.status(200).json({
          success: true,
          data: {
            id,
            ...memoryData,
          },
        });
      }
    }

    try {
      const doc = await adminDb.collection('products').doc(id).get();
      if (doc.exists) {
        const data = doc.data();
        if (data.userId !== uid) {
          return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to view this product.' });
        }
        return res.status(200).json({
          success: true,
          data: {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          },
        });
      }
    } catch (err) {
      console.warn('[FIRESTORE READ WARNING]:', err.message);
    }

    res.status(404).json({
      error: 'NotFound',
      message: 'Product not found.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products/:id/regenerate-asset
 * Regenerate single target asset URL without re-uploading original media
 */
export const regenerateAsset = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { variantKey } = req.body;

    if (!variantKey) {
      return res.status(400).json({ error: 'Validation', message: 'Target variantKey is required.' });
    }

    let publicId;
    if (memoryProductStore.has(id)) {
      publicId = memoryProductStore.get(id)?.originalAsset?.publicId;
    }

    if (!publicId) {
      const doc = await adminDb.collection('products').doc(id).get();
      if (doc.exists && doc.data().userId === uid) {
        publicId = doc.data().originalAsset?.publicId;
      }
    }

    if (!publicId) {
      return res.status(404).json({ error: 'NotFound', message: 'Product or master Cloudinary asset not found.' });
    }

    const newUrl = regenerateSingleAssetUrl(publicId, variantKey);

    res.status(200).json({
      success: true,
      variantKey,
      url: newUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
