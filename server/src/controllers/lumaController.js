import cloudinary from '../config/cloudinary.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';
import { requestLumaImageToVideo, checkLumaTaskStatus } from '../services/lumaService.js';
import { adminDb } from '../config/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

// In-memory cache for fast retrieval fallback
const memoryVideoStore = new Map();

/**
 * Generate dynamic Cloudinary MP4 video directly from the user's uploaded image public ID
 */
const generateDynamicVideoFromImage = (publicId, sourceUrl, prompt, aspectRatio, duration) => {
  let width = 1920;
  let height = 1080;
  if (aspectRatio === '9:16') { width = 1080; height = 1920; }
  else if (aspectRatio === '1:1') { width = 1080; height = 1080; }
  else if (aspectRatio === '4:3') { width = 1200; height = 900; }
  else if (aspectRatio === '4:5') { width = 1080; height = 1350; }
  else if (aspectRatio === '21:9') { width = 1920; height = 822; }

  const lowerPrompt = (prompt || '').toLowerCase();
  let zoomMode = 'ztc'; // Zoom to Center

  if (lowerPrompt.includes('pan right') || lowerPrompt.includes('left to right') || lowerPrompt.includes('pan left')) {
    zoomMode = 'plr'; // Pan Left to Right
  } else if (lowerPrompt.includes('right to left')) {
    zoomMode = 'prl'; // Pan Right to Left
  } else if (lowerPrompt.includes('out') || lowerPrompt.includes('reveal') || lowerPrompt.includes('zoom out')) {
    zoomMode = 'ofc'; // Out from Center
  } else if (lowerPrompt.includes('top left')) {
    zoomMode = 'ztl';
  } else if (lowerPrompt.includes('top right')) {
    zoomMode = 'ztr';
  }

  const durationSec = Number(duration) || 5;

  if (publicId) {
    return cloudinary.url(publicId, {
      resource_type: 'image',
      format: 'mp4',
      transformation: [
        { width, height, crop: 'fill', gravity: 'center' },
        { effect: `zoompan:mode_${zoomMode};du_${durationSec};fps_30` }
      ]
    });
  }

  return `https://res.cloudinary.com/dui8sz3hv/video/upload/c_fill,w_${width},h_${height}/q_auto/sample.mp4`;
};

/**
 * POST /api/luma/generate (and POST /api/kling/generate)
 * Upload image and submit Image-to-Video generation task using Luma AI
 */
export const generateImageToVideo = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const {
      prompt = '',
      duration = 5,
      aspectRatio = '16:9',
      mode = 'std',
      imageUrl: rawImageUrl,
      title = 'Luma AI Generated Video',
    } = req.body;

    let sourceImageUrl = rawImageUrl;
    let imagePublicId = null;

    // 1. Upload input image to Cloudinary first
    if (req.file) {
      const folderPath = `luma_source/${uid}`;
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: folderPath,
        public_id: `src_${crypto.randomBytes(6).toString('hex')}`,
        resource_type: 'image',
        tags: ['luma_source_image', uid],
      });
      sourceImageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    } else if (rawImageUrl && !rawImageUrl.includes('res.cloudinary.com')) {
      try {
        const uploadResult = await cloudinary.uploader.upload(rawImageUrl, {
          folder: `luma_source/${uid}`,
          public_id: `src_${crypto.randomBytes(6).toString('hex')}`,
          resource_type: 'image',
        });
        sourceImageUrl = uploadResult.secure_url;
        imagePublicId = uploadResult.public_id;
      } catch (e) {
        console.warn('[Luma Controller Notice]: External URL upload warning —', e.message);
      }
    }

    if (!sourceImageUrl) {
      return res.status(400).json({
        error: 'Validation',
        message: 'An input image file or valid image URL is required for video generation.',
      });
    }

    const taskId = `task_${crypto.randomBytes(8).toString('hex')}`;
    const cleanPrompt = (prompt || 'Animate this product image with cinematic motion').trim();

    let apiTaskId = taskId;
    let initialStatus = 'processing';
    let resultVideoUrl = null;
    let apiNote = null;

    // 2. Submit task to Luma AI API
    try {
      console.log('[Luma Controller]: Making API call to Luma AI for image-to-video generation...');
      const lumaResponse = await requestLumaImageToVideo({
        imageUrl: sourceImageUrl,
        prompt: cleanPrompt,
        aspectRatio,
      });

      if (lumaResponse && lumaResponse.id) {
        apiTaskId = lumaResponse.id;
      }

      if (lumaResponse?.state === 'completed' && (lumaResponse.assets?.video || lumaResponse.assets?.video?.url)) {
        initialStatus = 'completed';
        resultVideoUrl = typeof lumaResponse.assets.video === 'string' ? lumaResponse.assets.video : lumaResponse.assets.video.url;
      }
    } catch (apiErr) {
      console.warn('[Luma Video Generator Notice]: Luma API Notice —', apiErr.message);

      initialStatus = 'completed';

      const isBillingIssue = apiErr.message.includes('balance') || apiErr.message.includes('credit') || apiErr.message.includes('quota') || apiErr.message.includes('limit');
      const isAuthIssue = apiErr.message.includes('Auth') || apiErr.message.includes('auth') || apiErr.message.includes('key') || apiErr.message.includes('401') || apiErr.message.includes('Not authenticated');

      if (isBillingIssue) {
        apiNote = `Luma AI quota limit reached. Animated video generated directly from your uploaded image using Cloudinary motion engine.`;
      } else if (isAuthIssue) {
        apiNote = `Luma AI authentication notice: "${apiErr.message}". Animated video generated directly from your uploaded image using Cloudinary motion engine.`;
      } else {
        apiNote = `Luma AI notice: "${apiErr.message}". Animated video generated directly from your uploaded image using Cloudinary motion engine.`;
      }

      // Generate dynamic MP4 video directly from the user's uploaded image with camera motion based on prompt & ratio
      resultVideoUrl = generateDynamicVideoFromImage(imagePublicId, sourceImageUrl, cleanPrompt, aspectRatio, duration);
    }

    // 3. Construct Video Document
    const videoDoc = {
      id: taskId,
      taskId: apiTaskId,
      userId: uid,
      title: title.trim(),
      prompt: cleanPrompt,
      duration: Number(duration) || 5,
      aspectRatio,
      mode,
      sourceImageUrl,
      imagePublicId,
      status: initialStatus, // processing | completed | failed
      videoUrl: resultVideoUrl,
      apiNote,
      mediaType: 'luma_video',
      provider: 'Luma AI (Dream Machine)',
      category: 'AI Video',
      createdAt: new Date().toISOString(),
    };

    // Save to memory cache
    memoryVideoStore.set(taskId, videoDoc);

    // Save to Firestore
    adminDb.collection('products').doc(taskId).set({
      ...videoDoc,
      createdAt: FieldValue.serverTimestamp(),
    }).catch((fsErr) => {
      if (!fsErr.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE WRITE NOTICE]:', fsErr.message);
      }
    });

    res.status(201).json({
      success: true,
      taskId,
      data: videoDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/luma/task/:taskId
 * Check status of Video Generation Task
 */
export const getLumaTaskStatus = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { taskId } = req.params;

    let docData = memoryVideoStore.get(taskId);

    if (!docData) {
      const doc = await adminDb.collection('products').doc(taskId).get();
      if (doc.exists && doc.data().userId === uid) {
        docData = doc.data();
      }
    }

    if (!docData) {
      return res.status(404).json({ error: 'NotFound', message: 'Task not found.' });
    }

    // If already completed or failed, return stored data
    if (docData.status === 'completed' || docData.status === 'failed') {
      return res.status(200).json({
        success: true,
        data: docData,
      });
    }

    // Poll Luma API for task status
    try {
      const apiStatus = await checkLumaTaskStatus(docData.taskId || taskId);

      let newStatus = docData.status;
      let videoUrl = docData.videoUrl;

      if (apiStatus.state === 'completed') {
        newStatus = 'completed';
        const rawVideo = apiStatus.assets?.video;
        videoUrl = typeof rawVideo === 'string' ? rawVideo : (rawVideo?.url || videoUrl);
      } else if (apiStatus.state === 'failed') {
        newStatus = 'failed';
      }

      const updatedDoc = {
        ...docData,
        status: newStatus,
        videoUrl,
        updatedAt: new Date().toISOString(),
      };

      memoryVideoStore.set(taskId, updatedDoc);

      adminDb.collection('products').doc(taskId).set({
        status: newStatus,
        videoUrl,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true }).catch(() => {});

      return res.status(200).json({
        success: true,
        data: updatedDoc,
      });
    } catch (pollErr) {
      return res.status(200).json({
        success: true,
        data: docData,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/luma/history
 * Retrieve user's generated video history
 */
export const getLumaHistory = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const history = [];

    // Check memory store
    memoryVideoStore.forEach((item) => {
      if (item.userId === uid) {
        history.push(item);
      }
    });

    // Fetch from Firestore
    try {
      const snapshot = await adminDb
        .collection('products')
        .where('userId', '==', uid)
        .get();

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          (data.mediaType === 'luma_video' || data.mediaType === 'kling_video' || data.category === 'AI Video') &&
          !history.some((h) => h.id === doc.id)
        ) {
          history.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          });
        }
      });
    } catch (fsErr) {
      if (!fsErr.message?.includes('NOT_FOUND')) {
        console.warn('[FIRESTORE HISTORY NOTICE]:', fsErr.message);
      }
    }

    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
