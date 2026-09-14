import cloudinary from '../config/cloudinary.js';

/**
 * Upload raw image buffer to Cloudinary using upload_stream
 * Safe ingestion without forcing optional paid add-on flags (e.g. google_tagging) in the upload options
 */
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        colors: true,            // Cloudinary dominant color analysis
        quality_analysis: true,  // Cloudinary AI image quality analysis
        accessibility_analysis: true, // Cloudinary AI alt text/captioning
        watermark: true,         // Cloudinary watermark detection
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Generate transparent background asset URL using Cloudinary background_removal effect
 */
export const getTransparentBgUrl = (publicId) => {
  return cloudinary.url(publicId, {
    effect: 'background_removal',
    fetch_format: 'png',
    quality: 'auto',
    secure: true,
  });
};

/**
 * Generate automatic content-aware smart crop URL with gravity auto (FOR LIFESTYLE SCENES ONLY)
 */
export const getSmartCropUrl = (publicId, width = 600, height = 600, crop = 'fill') => {
  return cloudinary.url(publicId, {
    width: width,
    height: height,
    crop: crop,
    gravity: 'auto',
    fetch_format: 'auto',
    quality: 'auto',
    secure: true,
  });
};

/**
 * Delete all Cloudinary resources in a folder via Admin API
 */
export const deleteCloudinaryFolderAssets = async (folderPath) => {
  try {
    await cloudinary.api.delete_resources_by_prefix(folderPath);
    await cloudinary.api.delete_folder(folderPath).catch(() => { });
  } catch (err) {
    console.warn('[CLOUDINARY DELETION NOTICE]:', err.message);
  }
};

/**
 * Centralized Transformation Engine based on Two-Branch Composition Architecture:
 * 1. Product-Centric Assets: Composes the Cloudinary background-removed product cutout on clean canvas with padding/scaling.
 * 2. Lifestyle / Scene Assets: Uses content-aware (gravity auto) reframing on the original master image.
 */
export const generatePlatformVariants = (publicId) => {
  return {
    // =========================================================================
    // 1. PRODUCT-CENTRIC ASSETS (Cloudinary Cutout Layered Composition)
    // =========================================================================

    // Marketplace Square (1000x1000): Product cutout centered on neutral white canvas, 80% scale (l_cutout / c_fit,w_800,h_800 / g_center / b_white)
    marketplaceSquare: cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 800, height: 800, crop: 'fit' },
        { width: 1000, height: 1000, crop: 'lpad', gravity: 'center', background: 'white', fetch_format: 'auto', quality: 'auto' }
      ]
    }),

    // Store Catalog (1000x1000): Product cutout on light off-white background with generous padding
    storeCatalog: cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 750, height: 750, crop: 'fit' },
        { width: 1000, height: 1000, crop: 'lpad', gravity: 'center', background: 'rgb:f8fafc', fetch_format: 'auto', quality: 'auto' }
      ]
    }),

    // Product Thumbnail (300x300): Cutout perfectly contained and clear at thumbnail scale
    productThumbnail: cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 240, height: 240, crop: 'fit' },
        { width: 300, height: 300, crop: 'lpad', gravity: 'center', background: 'white', fetch_format: 'auto', quality: 'auto' }
      ]
    }),

    // Transparent Background Product (PNG)
    transparentProduct: cloudinary.url(publicId, {
      effect: 'background_removal',
      fetch_format: 'png',
      quality: 'auto'
    }),

    // High-Res Product (1600x1600): Studio high-res cutout composed on crisp canvas
    highResProduct: cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 1350, height: 1350, crop: 'fit' },
        { width: 1600, height: 1600, crop: 'lpad', gravity: 'center', background: 'white', fetch_format: 'auto', quality: 'auto' }
      ]
    }),

    // Social Square (1080x1080): Balanced product cutout with subtle soft padding
    socialSquare: cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 850, height: 850, crop: 'fit' },
        { width: 1080, height: 1080, crop: 'lpad', gravity: 'center', background: 'white', fetch_format: 'auto', quality: 'auto' }
      ]
    }),

    // Portrait Social (1080x1350 4:5): Vertical balanced product cutout with top/bottom vertical breathing room
    portraitSocial: cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 850, height: 950, crop: 'fit' },
        { width: 1080, height: 1350, crop: 'lpad', gravity: 'center', background: 'rgb:f8fafc', fetch_format: 'auto', quality: 'auto' }
      ]
    }),

    // Story / TikTok (1080x1920 9:16): Prominent vertical placement without touching canvas edges
    storyVertical: cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 900, height: 1200, crop: 'fit' },
        { width: 1080, height: 1920, crop: 'lpad', gravity: 'center', background: 'rgb:f1f5f9', fetch_format: 'auto', quality: 'auto' }
      ]
    }),

    // Website Product Card (800x600 4:3): Product-dominant web card with controlled whitespace
    websiteProductCard: cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 620, height: 480, crop: 'fit' },
        { width: 800, height: 600, crop: 'lpad', gravity: 'center', background: 'white', fetch_format: 'auto', quality: 'auto' }
      ]
    }),

    // Mobile Product Asset (600x450 4:3): Fully contained product asset for mobile app views
    mobileProductAsset: cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 480, height: 360, crop: 'fit' },
        { width: 600, height: 450, crop: 'lpad', gravity: 'center', background: 'white', fetch_format: 'auto', quality: 'auto' }
      ]
    }),

    // =========================================================================
    // 2. SPECIAL COMPOSITION: WEBSITE HERO BANNERS (1920x600 Widescreen)
    // =========================================================================

    // Preferred Hero Strategy: Composes product cutout intentionally inside 1920x600 banner canvas with negative space for typography
    websiteLandscape: cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 850, height: 500, crop: 'fit' },
        { width: 1920, height: 600, crop: 'lpad', gravity: 'east', background: 'rgb:f8fafc', fetch_format: 'auto', quality: 'auto' }
      ]
    }),

    // Secondary Lifestyle Scene Banner (1920x600): Object-aware reframing of original scene
    websiteHeroLifestyle: cloudinary.url(publicId, {
      width: 1920,
      height: 600,
      crop: 'fill',
      gravity: 'auto',
      fetch_format: 'auto',
      quality: 'auto'
    }),
  };
};

/**
 * Regenerate single target asset URL dynamically
 */
export const regenerateSingleAssetUrl = (publicId, variantKey) => {
  const variants = generatePlatformVariants(publicId);
  return variants[variantKey] || cloudinary.url(publicId, { fetch_format: 'auto', quality: 'auto', secure: true });
};

/**
 * Search Cloudinary Assets using the official Cloudinary Search API
 * Constructs expression with folder/user context and optional search terms
 */
export const searchCloudinaryAssets = async ({ uid, query, maxResults = 50, nextCursor = null }) => {
  let search = cloudinary.search
    .expression(`folder:products/${uid}/*`)
    .sort_by('created_at', 'desc')
    .max_results(maxResults);

  if (query && query.trim()) {
    const cleanQuery = query.trim().replace(/['"]/g, '');
    search = cloudinary.search
      .expression(`folder:products/${uid}/* AND (tags:"${cleanQuery}" OR context.product_name:"${cleanQuery}*" OR context.category:"${cleanQuery}*")`)
      .sort_by('created_at', 'desc')
      .max_results(maxResults);
  }

  if (nextCursor) {
    search = search.next_cursor(nextCursor);
  }

  const result = await search.execute();
  return result;
};

/**
 * Calculate Application-Level Commerce Image Readiness Score based on real signals
 */
export const calculateCommerceReadiness = ({ qualityScore, watermark, isProductStudio, hasTransparentBg, hasCrops }) => {
  let score = 50;

  if (qualityScore !== null && qualityScore !== undefined) {
    score += Math.min(Math.round(qualityScore * 30), 30);
  } else {
    score += 15;
  }

  if (watermark === false) score += 10;
  if (isProductStudio) score += 10;
  if (hasTransparentBg) score += 10;
  if (hasCrops) score += 10;

  score = Math.min(score, 100);

  let status = 'READY';
  if (score < 60) status = 'NOT READY';
  else if (score < 80) status = 'NEEDS REVIEW';

  return {
    score,
    status,
    notes: [
      `Overall Commerce Readiness: ${score}/100`,
      watermark ? 'Warning: Watermark detected' : 'Clean watermark status',
      isProductStudio ? 'Studio product classification confirmed' : 'General lifestyle image',
    ],
  };
};

/**
 * PHASE 9 — SMART SOCIAL MEDIA CONTENT FACTORY PRESETS
 * Centralized platform preset configuration mapping 9 social/web/profile targets to Cloudinary transformation rules.
 */
export const socialPresets = {
  instagramPost: {
    type: 'instagramPost',
    name: 'Instagram Post',
    platform: 'Instagram',
    category: 'Social',
    specs: '1080 × 1080',
    width: 1080,
    height: 1080,
    format: 'jpg',
    sourceType: 'background-removed-cutout',
    transform: (publicId) => cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 860, height: 860, crop: 'fit' },
        { width: 1080, height: 1080, crop: 'lpad', gravity: 'center', background: 'rgb:f8fafc', fetch_format: 'auto', quality: 'auto' }
      ]
    })
  },
  instagramPortrait: {
    type: 'instagramPortrait',
    name: 'Instagram Portrait',
    platform: 'Instagram',
    category: 'Social',
    specs: '1080 × 1350',
    width: 1080,
    height: 1350,
    format: 'jpg',
    sourceType: 'background-removed-cutout',
    transform: (publicId) => cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 880, height: 1100, crop: 'fit' },
        { width: 1080, height: 1350, crop: 'lpad', gravity: 'center', background: 'rgb:f8fafc', fetch_format: 'auto', quality: 'auto' }
      ]
    })
  },
  instagramStory: {
    type: 'instagramStory',
    name: 'Instagram Story / TikTok',
    platform: 'Instagram',
    category: 'Social',
    specs: '1080 × 1920',
    width: 1080,
    height: 1920,
    format: 'jpg',
    sourceType: 'background-removed-cutout',
    transform: (publicId) => cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 840, height: 1500, crop: 'fit' },
        { width: 1080, height: 1920, crop: 'lpad', gravity: 'center', background: 'rgb:f1f5f9', fetch_format: 'auto', quality: 'auto' }
      ]
    })
  },
  youtubeThumbnail: {
    type: 'youtubeThumbnail',
    name: 'YouTube Thumbnail',
    platform: 'YouTube',
    category: 'Social',
    specs: '1280 × 720',
    width: 1280,
    height: 720,
    format: 'jpg',
    sourceType: 'background-removed-cutout',
    transform: (publicId) => cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 680, height: 600, crop: 'fit' },
        { width: 1280, height: 720, crop: 'lpad', gravity: 'center', background: 'rgb:0f172a', fetch_format: 'auto', quality: 'auto' }
      ]
    })
  },
  socialSquare: {
    type: 'socialSquare',
    name: 'Generic Social Square',
    platform: 'Generic Social',
    category: 'Social',
    specs: '1080 × 1080',
    width: 1080,
    height: 1080,
    format: 'jpg',
    sourceType: 'background-removed-cutout',
    transform: (publicId) => cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 860, height: 860, crop: 'fit' },
        { width: 1080, height: 1080, crop: 'lpad', gravity: 'center', background: 'white', fetch_format: 'auto', quality: 'auto' }
      ]
    })
  },
  socialLandscape: {
    type: 'socialLandscape',
    name: 'Social Landscape Share',
    platform: 'Twitter / LinkedIn',
    category: 'Social',
    specs: '1200 × 630',
    width: 1200,
    height: 630,
    format: 'jpg',
    sourceType: 'background-removed-cutout',
    transform: (publicId) => cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 650, height: 530, crop: 'fit' },
        { width: 1200, height: 630, crop: 'lpad', gravity: 'center', background: 'rgb:f8fafc', fetch_format: 'auto', quality: 'auto' }
      ]
    })
  },
  websiteDesktop: {
    type: 'websiteDesktop',
    name: 'Website Desktop Hero Banner',
    platform: 'Web',
    category: 'Web',
    specs: '1920 × 600',
    width: 1920,
    height: 600,
    format: 'webp',
    sourceType: 'background-removed-cutout',
    transform: (publicId) => cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 850, height: 500, crop: 'fit' },
        { width: 1920, height: 600, crop: 'lpad', gravity: 'east', background: 'rgb:f8fafc', fetch_format: 'auto', quality: 'auto' }
      ]
    })
  },
  websiteMobile: {
    type: 'websiteMobile',
    name: 'Website Mobile Banner',
    platform: 'Web',
    category: 'Web',
    specs: '600 × 450',
    width: 600,
    height: 450,
    format: 'webp',
    sourceType: 'background-removed-cutout',
    transform: (publicId) => cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 480, height: 360, crop: 'fit' },
        { width: 600, height: 450, crop: 'lpad', gravity: 'center', background: 'rgb:f8fafc', fetch_format: 'auto', quality: 'auto' }
      ]
    })
  },
  profile: {
    type: 'profile',
    name: 'Profile / Avatar Thumbnail',
    platform: 'Profile',
    category: 'Profile',
    specs: '800 × 800',
    width: 800,
    height: 800,
    format: 'jpg',
    sourceType: 'background-removed-cutout',
    transform: (publicId) => cloudinary.url(publicId, {
      transformation: [
        { effect: 'background_removal' },
        { width: 640, height: 640, crop: 'fit' },
        { width: 800, height: 800, crop: 'lpad', gravity: 'center', background: 'white', fetch_format: 'auto', quality: 'auto' }
      ]
    })
  }
};

/**
 * Generate selected social media content factory formats using centralized presets
 */
export const generateSocialFormats = (publicId, selectedKeys = []) => {
  const keysToProcess = selectedKeys.length > 0 ? selectedKeys : Object.keys(socialPresets);
  const results = [];

  keysToProcess.forEach((key) => {
    const preset = socialPresets[key];
    if (preset) {
      const generatedUrl = preset.transform(publicId);
      results.push({
        type: preset.type,
        name: preset.name,
        platform: preset.platform,
        category: preset.category,
        specs: preset.specs,
        width: preset.width,
        height: preset.height,
        format: preset.format,
        url: generatedUrl,
        publicId: publicId,
        sourceType: preset.sourceType,
        sourceAssetId: publicId,
        createdAt: new Date().toISOString()
      });
    }
  });

  return results;
};

