import { adminAuth } from '../config/firebaseAdmin.js';

/**
 * Middleware to verify Firebase ID tokens passed in Authorization header
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Expected Bearer token.'
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    next();
  } catch (error) {
    console.error('[AUTH ERROR]: Token verification failed', error.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired Firebase authentication token.'
    });
  }
};
