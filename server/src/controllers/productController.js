import {
  uploadBufferToCloudinary,
  getTransparentBgUrl,
  getSmartCropUrl,
  generatePlatformVariants,
  regenerateSingleAssetUrl,
  searchCloudinaryAssets,
  deleteCloudinaryFolderAssets,
  calculateCommerceReadiness,
} from '../services/cloudinaryService.js';
import { adminDb } from '../config/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';
import JSZip from 'jszip';

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
      if (!fsErr.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE READ NOTICE]:', fsErr.message);
      }
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
 * Full Product Media Intelligence Pipeline Orchestration with Two-Branch Composition
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
      // Build searchable metadata context & tags for Cloudinary
      const metaTags = [name.trim(), category, 'commerce_asset', uid].filter(Boolean);
      const metaContext = {
        product_id: productId,
        product_name: name.trim(),
        category: category || 'Uncategorized',
        user_id: uid,
      };

      uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: folderPath,
        public_id: 'original',
        resource_type: 'image',
        tags: metaTags,
        context: metaContext,
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

    let caption = null;
    if (uploadResult.accessibility_analysis?.caption) {
      caption = uploadResult.accessibility_analysis.caption;
    } else {
      pipelineNotes.push('AI Image Captioning add-on disabled on Cloudinary account.');
    }

    let qualityScore = null;
    let qualityRating = 'Good';
    if (uploadResult.quality_analysis?.focus !== undefined) {
      qualityScore = Math.round(uploadResult.quality_analysis.focus * 100);
      if (qualityScore >= 85) qualityRating = 'Excellent';
      else if (qualityScore < 60) qualityRating = 'Needs improvement';
    } else {
      pipelineNotes.push('Image Quality Analysis unavailable on standard upload.');
    }

    let watermarkDetected = false;
    let watermarkStatus = 'None detected';
    if (uploadResult.watermark !== undefined) {
      watermarkDetected = Boolean(uploadResult.watermark);
      watermarkStatus = watermarkDetected ? 'Watermark detected' : 'None detected';
    } else {
      pipelineNotes.push('Watermark detection add-on unavailable.');
    }

    let imageType = 'Product / Studio';
    if (uploadResult.info?.shop_classifier) {
      imageType = uploadResult.info.shop_classifier.is_product ? 'Product / Studio' : 'Lifestyle / Natural';
    }

    let dominantColors = [];
    if (uploadResult.colors && Array.isArray(uploadResult.colors)) {
      dominantColors = uploadResult.colors.slice(0, 4).map((c) => c[0]);
    }

    const moderationStatus = uploadResult.moderation && uploadResult.moderation.length > 0
      ? uploadResult.moderation[0].status
      : 'unavailable';

    // 3. Generate Transformations via Two-Branch Composition Architecture
    const squareCropUrl = getSmartCropUrl(uploadResult.public_id, 1000, 1000, 'fill');
    const portraitCropUrl = getSmartCropUrl(uploadResult.public_id, 1080, 1350, 'fill');
    const landscapeCropUrl = getSmartCropUrl(uploadResult.public_id, 1920, 600, 'fill');

    // Centralized Transformation Engine Call
    const generatedVariants = generatePlatformVariants(uploadResult.public_id);

    const assetPacks = {
      ecommerce: [
        { type: 'transparent-product', platform: 'E-commerce', title: 'Transparent Cutout', url: generatedVariants.transparentProduct, publicId: uploadResult.public_id, format: 'png', specs: 'Dynamic PNG Cutout' },
        { type: 'marketplaceSquare', platform: 'Marketplace', title: 'Product Square', url: generatedVariants.marketplaceSquare, publicId: uploadResult.public_id, format: 'jpg', specs: '1000 × 1000 Cutout Composition (80% Scale)' },
        { type: 'storeCatalog', platform: 'Store Catalog', title: 'Catalog View', url: generatedVariants.storeCatalog, publicId: uploadResult.public_id, format: 'jpg', specs: '1000 × 1000 Cutout Composition (Off-White Bg)' },
        { type: 'productThumbnail', platform: 'Store Catalog', title: 'Product Thumbnail', url: generatedVariants.productThumbnail, publicId: uploadResult.public_id, format: 'webp', specs: '300 × 300 Cutout Composition' },
        { type: 'highResProduct', platform: 'High-Res Studio', title: 'High-Res Asset', url: generatedVariants.highResProduct, publicId: uploadResult.public_id, format: 'jpg', specs: '1600 × 1600 High-Res Cutout' },
      ],
      social: [
        { type: 'socialSquare', platform: 'Instagram', title: 'Social Square Feed', url: generatedVariants.socialSquare, publicId: uploadResult.public_id, format: 'jpg', specs: '1080 × 1080 (1:1 Cutout Balance)' },
        { type: 'portraitSocial', platform: 'Instagram / Pinterest', title: 'Portrait Social Post', url: generatedVariants.portraitSocial, publicId: uploadResult.public_id, format: 'jpg', specs: '1080 × 1350 (4:5 Vertical Cutout)' },
        { type: 'storyVertical', platform: 'Instagram Story / TikTok', title: 'Story Vertical Banner', url: generatedVariants.storyVertical, publicId: uploadResult.public_id, format: 'jpg', specs: '1080 × 1920 (9:16 Vertical Canvas)' },
      ],
      web: [
        { type: 'websiteProductCard', platform: 'Website', title: 'Product Card Asset', url: generatedVariants.websiteProductCard, publicId: uploadResult.public_id, format: 'webp', specs: '800 × 600 Card Cutout' },
        { type: 'websiteLandscape', platform: 'Website Widescreen', title: 'Desktop Hero Banner', url: generatedVariants.websiteLandscape, publicId: uploadResult.public_id, format: 'webp', specs: '1920 × 600 Product Hero Composition' },
        { type: 'websiteHeroLifestyle', platform: 'Website Widescreen', title: 'Desktop Lifestyle Banner', url: generatedVariants.websiteHeroLifestyle, publicId: uploadResult.public_id, format: 'jpg', specs: '1920 × 600 Content-Aware Scene Crop' },
        { type: 'mobileProductAsset', platform: 'Mobile App', title: 'Mobile App Asset', url: generatedVariants.mobileProductAsset, publicId: uploadResult.public_id, format: 'webp', specs: '600 × 450 Mobile Asset' },
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
      if (!fsErr.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE WRITE NOTICE]: Database write deferred, payload memory cached.', fsErr.message);
      }
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
      if (!err.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE READ NOTICE]:', err.message);
      }
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

/**
 * GET /api/products/assets/search
 * Server-side Cloudinary Search API execution integrated with Firestore user metadata & asset flattening
 */
export const searchUserAssets = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { q, category, platform, productId, nextCursor, limit = 50 } = req.query;

    // 1. Fetch user products from Firestore + memory store to build full asset metadata map
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
      if (!fsErr.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE SEARCH READ NOTICE]:', fsErr.message);
      }
    }

    memoryProductStore.forEach((item, id) => {
      if (item.userId === uid && !products.some((p) => p.id === id)) {
        products.unshift({ id, ...item });
      }
    });

    // 2. Query Cloudinary Search API server-side
    let cloudinarySearchResult = null;
    let cloudinaryErrorNotice = null;
    try {
      cloudinarySearchResult = await searchCloudinaryAssets({
        uid,
        query: q || '',
        maxResults: parseInt(limit, 10) || 50,
        nextCursor: nextCursor || null,
      });
    } catch (cErr) {
      console.warn('[CLOUDINARY SEARCH API NOTICE]:', cErr.message);
      cloudinaryErrorNotice = cErr.message;
    }

    // 3. Build flattened real generated asset catalog
    let allGeneratedAssets = [];

    products.forEach((prod) => {
      // Filter by productId if requested
      if (productId && prod.id !== productId) return;

      const pTags = Array.isArray(prod.analysis?.tags)
        ? prod.analysis.tags.map((t) => (typeof t === 'string' ? t : t.name))
        : [];

      // Original master
      if (prod.originalAsset) {
        allGeneratedAssets.push({
          id: `${prod.id}_orig`,
          productId: prod.id,
          productName: prod.name,
          userId: prod.userId,
          title: 'Original Master Image',
          type: 'original',
          platform: 'Master',
          category: 'E-commerce',
          publicId: prod.originalAsset.publicId,
          url: prod.originalAsset.url,
          width: prod.originalAsset.width || 1000,
          height: prod.originalAsset.height || 1000,
          specs: `${prod.originalAsset.width || 1000} × ${prod.originalAsset.height || 1000} Master`,
          format: (prod.originalAsset.format || 'jpg').toLowerCase(),
          bytes: prod.originalAsset.bytes || null,
          tags: pTags,
          createdAt: prod.createdAt,
        });
      }

      // Ecommerce pack
      (prod.assets?.ecommerce || []).forEach((ast, idx) => {
        allGeneratedAssets.push({
          id: `${prod.id}_eco_${idx}`,
          productId: prod.id,
          productName: prod.name,
          userId: prod.userId,
          title: ast.title || ast.type,
          type: ast.type,
          platform: ast.platform || 'E-commerce',
          category: 'E-commerce',
          publicId: ast.publicId || prod.originalAsset?.publicId,
          url: ast.url,
          width: 1000,
          height: 1000,
          specs: ast.specs || '1000 × 1000 Cutout',
          format: (ast.format || 'jpg').toLowerCase(),
          bytes: null,
          tags: pTags,
          createdAt: prod.createdAt,
        });
      });

      // Social pack
      (prod.assets?.social || []).forEach((ast, idx) => {
        allGeneratedAssets.push({
          id: `${prod.id}_soc_${idx}`,
          productId: prod.id,
          productName: prod.name,
          userId: prod.userId,
          title: ast.title || ast.type,
          type: ast.type,
          platform: ast.platform || 'Social',
          category: 'Social',
          publicId: ast.publicId || prod.originalAsset?.publicId,
          url: ast.url,
          width: 1080,
          height: 1080,
          specs: ast.specs || '1080 × 1080 Cutout',
          format: (ast.format || 'jpg').toLowerCase(),
          bytes: null,
          tags: pTags,
          createdAt: prod.createdAt,
        });
      });

      // Web pack
      (prod.assets?.web || []).forEach((ast, idx) => {
        allGeneratedAssets.push({
          id: `${prod.id}_web_${idx}`,
          productId: prod.id,
          productName: prod.name,
          userId: prod.userId,
          title: ast.title || ast.type,
          type: ast.type,
          platform: ast.platform || 'Website',
          category: 'Web',
          publicId: ast.publicId || prod.originalAsset?.publicId,
          url: ast.url,
          width: 1920,
          height: 600,
          specs: ast.specs || 'Web Asset',
          format: (ast.format || 'webp').toLowerCase(),
          bytes: null,
          tags: pTags,
          createdAt: prod.createdAt,
        });
      });
    });

    // 4. Apply query search matching across title, productName, tags, platform, and category
    let results = allGeneratedAssets;

    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      results = results.filter((ast) => {
        const nameMatch = ast.productName.toLowerCase().includes(term);
        const titleMatch = ast.title.toLowerCase().includes(term);
        const platformMatch = ast.platform.toLowerCase().includes(term);
        const categoryMatch = ast.category.toLowerCase().includes(term);
        const tagMatch = ast.tags.some((t) => t.toLowerCase().includes(term));
        return nameMatch || titleMatch || platformMatch || categoryMatch || tagMatch;
      });
    }

    if (category && category !== 'All') {
      results = results.filter((ast) => ast.category.toLowerCase() === category.toLowerCase());
    }

    if (platform && platform !== 'All') {
      results = results.filter((ast) => ast.platform.toLowerCase().includes(platform.toLowerCase()));
    }

    res.status(200).json({
      success: true,
      data: results,
      totalCount: results.length,
      cloudinarySearchExecuted: !!cloudinarySearchResult,
      cloudinaryTotalCount: cloudinarySearchResult?.total_count || null,
      cloudinaryNextCursor: cloudinarySearchResult?.next_cursor || null,
      cloudinaryNotice: cloudinaryErrorNotice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/products/:id
 * Rename a user product with strict ownership verification
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { name, category } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Validation', message: 'Product name is required.' });
    }

    let updatedDoc = null;

    // Check memory store
    if (memoryProductStore.has(id)) {
      const p = memoryProductStore.get(id);
      if (p.userId === uid) {
        p.name = name.trim();
        if (category) p.category = category.trim();
        memoryProductStore.set(id, p);
        updatedDoc = { id, ...p };
      }
    }

    // Check Firestore
    try {
      const docRef = adminDb.collection('products').doc(id);
      const doc = await docRef.get();
      if (doc.exists) {
        const data = doc.data();
        if (data.userId !== uid) {
          return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to update this product.' });
        }
        const updateData = { name: name.trim() };
        if (category) updateData.category = category.trim();
        await docRef.update(updateData);
        updatedDoc = { id, ...data, ...updateData };
      }
    } catch (fsErr) {
      if (!fsErr.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE UPDATE NOTICE]:', fsErr.message);
      }
    }

    if (!updatedDoc) {
      return res.status(404).json({ error: 'NotFound', message: 'Product not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Product renamed successfully.',
      data: updatedDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Delete product record from Firestore and remove Cloudinary folder assets with ownership check
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    let targetPublicId = null;

    // Remove from memory store if present
    if (memoryProductStore.has(id)) {
      const p = memoryProductStore.get(id);
      if (p.userId === uid) {
        targetPublicId = p.originalAsset?.publicId;
        memoryProductStore.delete(id);
      }
    }

    // Remove from Firestore
    try {
      const docRef = adminDb.collection('products').doc(id);
      const doc = await docRef.get();
      if (doc.exists) {
        const data = doc.data();
        if (data.userId !== uid) {
          return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to delete this product.' });
        }
        targetPublicId = data.originalAsset?.publicId || targetPublicId;
        await docRef.delete();
      }
    } catch (fsErr) {
      if (!fsErr.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE DELETE NOTICE]:', fsErr.message);
      }
    }

    // Clean Cloudinary folder asynchronously
    if (targetPublicId || id) {
      const folderPath = `products/${uid}/${id}`;
      deleteCloudinaryFolderAssets(folderPath).catch(() => { });
    }

    res.status(200).json({
      success: true,
      message: 'Product and associated media references deleted successfully.',
      id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products/:id/share
 * Generate or retrieve secure share token for product (stored in productShares/{shareToken})
 */
export const createProductShare = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    // Verify ownership
    let productDoc = null;
    if (memoryProductStore.has(id)) {
      const p = memoryProductStore.get(id);
      if (p.userId === uid) productDoc = { id, ...p };
    }

    if (!productDoc) {
      const doc = await adminDb.collection('products').doc(id).get();
      if (doc.exists && doc.data().userId === uid) {
        productDoc = { id: doc.id, ...doc.data() };
      }
    }

    if (!productDoc) {
      return res.status(404).json({ error: 'NotFound', message: 'Product not found or access denied.' });
    }

    const shareToken = `share_${crypto.randomBytes(12).toString('hex')}`;
    const shareRecord = {
      shareToken,
      productId: id,
      createdBy: uid,
      createdAt: new Date().toISOString(),
      enabled: true,
    };

    // Save share record in productShares collection
    try {
      await adminDb.collection('productShares').doc(shareToken).set(shareRecord);
    } catch (fsErr) {
      if (!fsErr.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE SHARE NOTICE]: Deferred share write.', fsErr.message);
      }
    }

    res.status(201).json({
      success: true,
      shareToken,
      shareUrl: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/share/${shareToken}`,
      data: shareRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/share/:shareToken
 * Public read-only resolver for share tokens
 */
export const getPublicShare = async (req, res, next) => {
  try {
    const { shareToken } = req.params;

    let productId = null;

    try {
      const shareDoc = await adminDb.collection('productShares').doc(shareToken).get();
      if (shareDoc.exists && shareDoc.data().enabled !== false) {
        productId = shareDoc.data().productId;
      }
    } catch (fsErr) {
      if (!fsErr.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE SHARE READ NOTICE]:', fsErr.message);
      }
    }

    // Fallback if token starts with share_ (allow memory cache resolution)
    if (!productId && shareToken.startsWith('share_')) {
      // Resolve from memory store
      memoryProductStore.forEach((p, pId) => {
        if (!productId) productId = pId;
      });
    }

    if (!productId) {
      return res.status(404).json({ error: 'NotFound', message: 'Share link is invalid or expired.' });
    }

    // Retrieve product document without exposing internal UID
    let productDoc = null;
    if (memoryProductStore.has(productId)) {
      productDoc = { id: productId, ...memoryProductStore.get(productId) };
    }

    if (!productDoc) {
      const doc = await adminDb.collection('products').doc(productId).get();
      if (doc.exists) {
        productDoc = { id: doc.id, ...doc.data() };
      }
    }

    if (!productDoc) {
      return res.status(404).json({ error: 'NotFound', message: 'Shared product not found.' });
    }

    // Sanitize output (remove sensitive internal user references)
    const publicPayload = {
      id: productDoc.id,
      name: productDoc.name,
      category: productDoc.category,
      originalAsset: productDoc.originalAsset,
      analysis: {
        tags: productDoc.analysis?.tags,
        caption: productDoc.analysis?.caption,
        imageType: productDoc.analysis?.imageType,
        dominantColors: productDoc.analysis?.dominantColors,
        qualityRating: productDoc.analysis?.qualityRating,
        commerceReadiness: productDoc.analysis?.commerceReadiness,
      },
      assets: productDoc.assets,
      createdAt: productDoc.createdAt,
    };

    res.status(200).json({
      success: true,
      data: publicPayload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id/assets/:variantKey
 * Remove individual generated asset variant from product metadata safely
 */
export const deleteSingleAsset = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id, variantKey } = req.params;

    let updatedPacks = null;

    // Helper to remove variant from packs object
    const removeVariant = (assetsObj) => {
      if (!assetsObj) return assetsObj;
      const copy = { ...assetsObj };
      Object.keys(copy).forEach((packKey) => {
        copy[packKey] = (copy[packKey] || []).filter((ast) => ast.type !== variantKey);
      });
      return copy;
    };

    if (memoryProductStore.has(id)) {
      const p = memoryProductStore.get(id);
      if (p.userId === uid) {
        p.assets = removeVariant(p.assets);
        memoryProductStore.set(id, p);
        updatedPacks = p.assets;
      }
    }

    try {
      const docRef = adminDb.collection('products').doc(id);
      const doc = await docRef.get();
      if (doc.exists) {
        const data = doc.data();
        if (data.userId !== uid) {
          return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to modify this product.' });
        }
        const newAssets = removeVariant(data.assets);
        await docRef.update({ assets: newAssets });
        updatedPacks = newAssets;
      }
    } catch (fsErr) {
      if (!fsErr.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE ASSET DELETE NOTICE]:', fsErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Asset variant '${variantKey}' removed.`,
      assets: updatedPacks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products/:id/share/toggle
 * Toggle share link status (enabled: true/false) with ownership check
 */
export const toggleProductShare = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { enabled } = req.body;

    // Verify ownership
    let productDoc = null;
    if (memoryProductStore.has(id)) {
      const p = memoryProductStore.get(id);
      if (p.userId === uid) productDoc = p;
    }

    if (!productDoc) {
      const doc = await adminDb.collection('products').doc(id).get();
      if (doc.exists && doc.data().userId === uid) {
        productDoc = doc.data();
      }
    }

    if (!productDoc) {
      return res.status(404).json({ error: 'NotFound', message: 'Product not found or access denied.' });
    }

    // Find shares for this product and update enabled state
    try {
      const sharesSnap = await adminDb.collection('productShares').where('productId', '==', id).get();
      const updates = [];
      sharesSnap.forEach((sDoc) => {
        updates.push(sDoc.ref.update({ enabled: Boolean(enabled) }));
      });
      await Promise.all(updates);
    } catch (fsErr) {
      if (!fsErr.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE SHARE TOGGLE NOTICE]:', fsErr.message);
      }
    }

    res.status(200).json({
      success: true,
      enabled: Boolean(enabled),
      message: enabled ? 'Sharing enabled' : 'Sharing disabled',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id/download
 * Package existing real Cloudinary assets into a structured ZIP archive without reprocessing
 */
export const downloadProductZip = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    // Retrieve product with ownership verification
    let productDoc = null;
    if (memoryProductStore.has(id)) {
      const p = memoryProductStore.get(id);
      if (p.userId === uid) productDoc = { id, ...p };
    }

    if (!productDoc) {
      const doc = await adminDb.collection('products').doc(id).get();
      if (doc.exists && doc.data().userId === uid) {
        productDoc = { id: doc.id, ...doc.data() };
      }
    }

    if (!productDoc) {
      return res.status(404).json({ error: 'NotFound', message: 'Product not found or access denied.' });
    }

    const safeName = (productDoc.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const zipFilename = `${safeName}-assets.zip`;

    // Collect all real asset URLs with clean relative paths
    const filesToCompress = [];

    if (productDoc.originalAsset?.url) {
      filesToCompress.push({
        url: productDoc.originalAsset.url,
        zipPath: `${safeName}/master/original-master.${productDoc.originalAsset.format || 'jpg'}`,
      });
    }

    (productDoc.assets?.ecommerce || []).forEach((ast) => {
      if (ast.url) {
        filesToCompress.push({
          url: ast.url,
          zipPath: `${safeName}/ecommerce/${ast.type || 'variant'}.${ast.format || 'jpg'}`,
        });
      }
    });

    (productDoc.assets?.social || []).forEach((ast) => {
      if (ast.url) {
        filesToCompress.push({
          url: ast.url,
          zipPath: `${safeName}/social/${ast.type || 'variant'}.${ast.format || 'jpg'}`,
        });
      }
    });

    (productDoc.assets?.web || []).forEach((ast) => {
      if (ast.url) {
        filesToCompress.push({
          url: ast.url,
          zipPath: `${safeName}/web/${ast.type || 'variant'}.${ast.format || 'webp'}`,
        });
      }
    });

    if (filesToCompress.length === 0) {
      return res.status(400).json({ error: 'NoAssets', message: 'No assets available for this product.' });
    }

    const zip = new JSZip();

    // Fetch images in parallel and add to JSZip
    await Promise.all(
      filesToCompress.map(async (file) => {
        try {
          const imgRes = await fetch(file.url);
          if (imgRes.ok) {
            const arrayBuffer = await imgRes.arrayBuffer();
            zip.file(file.zipPath, Buffer.from(arrayBuffer));
          }
        } catch (fErr) {
          console.warn(`[ZIP FETCH NOTICE]: Could not fetch ${file.url}`, fErr.message);
        }
      })
    );

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    // Set ZIP response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.send(zipBuffer);
  } catch (error) {
    next(error);
  }
};
