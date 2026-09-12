import cloudinary from '../config/cloudinary.js';

/**
 * GET /api/cloudinary/status
 * Safely tests connection to Cloudinary API without exposing secrets.
 */
export const checkCloudinaryStatus = async (req, res, next) => {
  try {
    const config = cloudinary.config();

    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      return res.status(400).json({
        status: 'error',
        message: 'Cloudinary credentials missing in server environment',
      });
    }

    // Ping Cloudinary Admin API
    const result = await cloudinary.api.ping();

    res.status(200).json({
      status: 'ok',
      message: 'Successfully connected to Cloudinary API',
      cloudName: config.cloud_name,
      cloudinaryPing: result.status || 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const isCloudNameMismatch = error?.error?.message === 'cloud_name mismatch';
    
    res.status(200).json({
      status: 'configured',
      message: isCloudNameMismatch
        ? 'Cloudinary API credentials loaded. Please verify your exact Cloudinary Cloud Name in server/.env (e.g. from Cloudinary Dashboard -> Product Environment Credentials).'
        : (error.message || 'Cloudinary API error'),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      details: error?.error?.message || error.message
    });
  }
};
