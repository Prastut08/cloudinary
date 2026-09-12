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
 * Generate automatic content-aware smart crop URL with gravity auto
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
 * Generate platform-specific transformation asset URLs (f_auto, q_auto, gravity auto)
 */
export const generatePlatformVariants = (publicId) => {
  return {
    // E-COMMERCE
    marketplaceSquare: cloudinary.url(publicId, { width: 1000, height: 1000, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto', secure: true }),
    productThumbnail: cloudinary.url(publicId, { width: 300, height: 300, crop: 'thumb', gravity: 'auto', fetch_format: 'auto', quality: 'auto', secure: true }),
    transparentProduct: cloudinary.url(publicId, { effect: 'background_removal', fetch_format: 'png', quality: 'auto', secure: true }),
    highResProduct: cloudinary.url(publicId, { width: 1600, height: 1600, crop: 'fit', fetch_format: 'auto', quality: 'auto', secure: true }),

    // SOCIAL
    socialSquare: cloudinary.url(publicId, { width: 1080, height: 1080, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto', secure: true }),
    portraitSocial: cloudinary.url(publicId, { width: 1080, height: 1350, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto', secure: true }),
    storyVertical: cloudinary.url(publicId, { width: 1080, height: 1920, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto', secure: true }),

    // WEB
    websiteProductCard: cloudinary.url(publicId, { width: 800, height: 600, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto', secure: true }),
    websiteLandscape: cloudinary.url(publicId, { width: 1920, height: 600, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto', secure: true }),
    mobileProductAsset: cloudinary.url(publicId, { width: 600, height: 450, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto', secure: true }),
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
