import {
  uploadVideoBufferToCloudinary,
  generateVideoVariants,
} from '../services/cloudinaryService.js';
import { adminDb } from '../config/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import { createNotification } from '../services/notificationService.js';
import crypto from 'crypto';

// In-memory store for instant video retrieval fallback
const memoryVideoStore = new Map();

/**
 * POST /api/videos/upload
 * Upload source video to Cloudinary preserving original, compute metadata,
 * generate description-driven platform variants via Cloudinary transformations.
 *
 * Body fields (multipart):
 *   - title / name: Video title
 *   - description: Free-text describing use case (e.g. "reels, youtube, cinematic hero")
 *   - video: Video file (multer field)
 */
export const uploadVideo = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { name = 'Video Asset', title, description = '' } = req.body;
    const videoTitle = (title || name || 'Video Asset').trim();
    const videoDescription = (description || '').trim();

    if (!req.file) {
      return res.status(400).json({ error: 'Validation', message: 'Video file is required.' });
    }

    const videoId = `vid_${crypto.randomBytes(8).toString('hex')}`;
    const folderPath = `videos/${uid}/${videoId}`;

    // 1. Upload original video buffer to Cloudinary (preserve original)
    let uploadResult;
    try {
      uploadResult = await uploadVideoBufferToCloudinary(req.file.buffer, {
        folder: folderPath,
        public_id: 'original',
        resource_type: 'video',
        tags: [videoTitle, 'video_asset', uid].filter(Boolean),
        context: {
          video_id: videoId,
          title: videoTitle,
          description: videoDescription,
          user_id: uid,
        },
      });
    } catch (err) {
      console.error('[CLOUDINARY VIDEO UPLOAD ERROR]:', err);
      return res.status(502).json({
        error: 'CloudinaryError',
        message: 'Failed to ingest video to Cloudinary.',
        details: err.message,
      });
    }

    // 2. Generate platform video variants using Cloudinary URL-based transformation system
    //    Pass description for AI-driven keyword matching of relevant aspect ratios
    const variants = generateVideoVariants(uploadResult.public_id, videoDescription);

    const variantKeys = Object.keys(variants);
    console.log(`[Video Pipeline] Cloudinary Ingestion — ${variantKeys.length} variants generated`);
    console.log('[Video Pipeline] Upload result:', {
      public_id: uploadResult.public_id,
      resource_type: uploadResult.resource_type,
      format: uploadResult.format,
      duration: uploadResult.duration,
      bytes: uploadResult.bytes,
    });
    console.log('[Video Pipeline] Description:', videoDescription || '(none — all ratios generated)');
    variantKeys.forEach((key) => {
      console.log(`[Video Pipeline] ${key} (${variants[key].aspectRatio}) URL:`, variants[key].url);
    });

    // 3. Construct Video Document
    const videoDoc = {
      userId: uid,
      title: videoTitle,
      name: videoTitle,
      description: videoDescription,
      mediaType: 'video',
      category: 'Video',
      cloudinaryPublicId: uploadResult.public_id,

      originalAsset: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        duration: uploadResult.duration || null,
        frameRate: uploadResult.frame_rate || null,
        bitRate: uploadResult.bit_rate || null,
        aspectRatio: uploadResult.width && uploadResult.height
          ? `${(uploadResult.width / uploadResult.height).toFixed(2)}:1`
          : '16:9',
      },

      variants,

      processingStatus: 'completed',
      createdAt: new Date().toISOString(),
    };

    // Store in memory cache
    memoryVideoStore.set(videoId, videoDoc);

    // Persist to Firestore products collection (unified media store) with mediaType = 'video'
    adminDb.collection('products').doc(videoId).set({
      ...videoDoc,
      createdAt: FieldValue.serverTimestamp(),
    }).then(() => {
      createNotification({
        userId: uid,
        type: 'processing_complete',
        title: 'Video variants ready',
        message: `Your video "${videoTitle}" is ready with ${variantKeys.length} platform variants.`,
        relatedId: videoId,
        relatedType: 'product',
      });
    }).catch((fsErr) => {
      if (!fsErr.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE VIDEO WRITE NOTICE]:', fsErr.message);
      }
    });

    res.status(201).json({
      success: true,
      videoId,
      data: {
        id: videoId,
        ...videoDoc,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/videos/:id
 * Retrieve video document by ID
 */
export const getVideoById = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    if (memoryVideoStore.has(id)) {
      const memoryData = memoryVideoStore.get(id);
      if (memoryData.userId === uid) {
        return res.status(200).json({
          success: true,
          data: { id, ...memoryData },
        });
      }
    }

    try {
      const doc = await adminDb.collection('products').doc(id).get();
      if (doc.exists) {
        const data = doc.data();
        if (data.userId !== uid) {
          return res.status(403).json({ error: 'Forbidden', message: 'Access denied.' });
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

    res.status(404).json({ error: 'NotFound', message: 'Video asset not found.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/videos/:id/variants
 * Generate or re-derive platform video variants for an existing video asset
 * Accepts optional body: { description } to re-run AI keyword matching
 */
export const generateVariantsForVideo = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { description = '' } = req.body || {};

    let publicId = null;
    let videoDoc = null;

    if (memoryVideoStore.has(id)) {
      videoDoc = memoryVideoStore.get(id);
      if (videoDoc.userId === uid) {
        publicId = videoDoc.originalAsset?.publicId;
      }
    }

    if (!publicId) {
      const doc = await adminDb.collection('products').doc(id).get();
      if (doc.exists && doc.data().userId === uid) {
        videoDoc = doc.data();
        publicId = videoDoc.originalAsset?.publicId;
      }
    }

    if (!publicId) {
      return res.status(404).json({ error: 'NotFound', message: 'Video asset not found.' });
    }

    // Use provided description or fallback to stored description
    const effectiveDescription = description || videoDoc.description || '';
    const variants = generateVideoVariants(publicId, effectiveDescription);

    // Update memory & Firestore
    const updatedVariants = {
      ...(videoDoc.variants || {}),
      ...variants,
    };

    if (memoryVideoStore.has(id)) {
      memoryVideoStore.set(id, { ...videoDoc, variants: updatedVariants, description: effectiveDescription });
    }

    adminDb.collection('products').doc(id).set({
      variants: updatedVariants,
      description: effectiveDescription,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }).catch(() => {});

    res.status(200).json({
      success: true,
      message: `Platform video variants updated (${Object.keys(variants).length} generated).`,
      variants: updatedVariants,
    });
  } catch (error) {
    next(error);
  }
};
