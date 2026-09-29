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
 * Upload source video to Cloudinary preserving original, compute metadata, generate 4 variants
 */
export const uploadVideo = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { name = 'Video Asset', title } = req.body;
    const videoTitle = (title || name || 'Video Asset').trim();

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

    // 2. Generate 4 platform video variants using Cloudinary URL-based transformation system
    const variants = generateVideoVariants(uploadResult.public_id);

    console.log('[Video Pipeline] Cloudinary Ingestion:', {
      public_id: uploadResult.public_id,
      resource_type: uploadResult.resource_type,
      format: uploadResult.format,
      duration: uploadResult.duration,
      bytes: uploadResult.bytes,
    });
    console.log('[Video Pipeline] Reels MP4 URL:', variants.reels916.url);
    console.log('[Video Pipeline] Square MP4 URL:', variants.square11.url);
    console.log('[Video Pipeline] YouTube MP4 URL:', variants.youtube169.url);
    console.log('[Video Pipeline] Web Video URL:', variants.web169.url);


    // 3. Construct Video Document
    const videoDoc = {
      userId: uid,
      title: videoTitle,
      name: videoTitle,
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

      variants: {
        reels916: variants.reels916,
        square11: variants.square11,
        youtube169: variants.youtube169,
        web169: variants.web169,
      },

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
        message: `Your video "${videoTitle}" is ready with 4 platform variants.`,
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
 */
export const generateVariantsForVideo = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

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

    const variants = generateVideoVariants(publicId);

    // Update memory & Firestore
    const updatedVariants = {
      ...(videoDoc.variants || {}),
      reels916: variants.reels916,
      square11: variants.square11,
      youtube169: variants.youtube169,
      web169: variants.web169,
    };

    if (memoryVideoStore.has(id)) {
      memoryVideoStore.set(id, { ...videoDoc, variants: updatedVariants });
    }

    adminDb.collection('products').doc(id).set({
      variants: updatedVariants,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Platform video variants updated.',
      variants: updatedVariants,
    });
  } catch (error) {
    next(error);
  }
};
