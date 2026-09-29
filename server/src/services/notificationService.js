import { adminDb } from '../config/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Server-side Notification Helper Service
 * Creates real user notifications in Firestore using Firebase Admin SDK.
 * 
 * @param {Object} params
 * @param {string} params.userId - Firebase UID of notification recipient
 * @param {string} params.type - Notification event type
 * @param {string} params.title - Title header
 * @param {string} params.message - Body text message
 * @param {string} [params.relatedId] - Related product/asset ID for direct navigation
 * @param {string} [params.relatedType='product'] - Entity type ('product', etc.)
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedId = null,
  relatedType = 'product',
}) => {
  if (!userId) {
    console.warn('[NOTIFICATION SERVICE WARNING]: Cannot create notification without userId.');
    return null;
  }

  try {
    const notificationRef = adminDb.collection('notifications').doc();
    const notificationData = {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
      relatedId,
      relatedType,
    };

    await notificationRef.set(notificationData);
    return {
      id: notificationRef.id,
      ...notificationData,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    // Non-blocking notification creation error log
    console.error('[NOTIFICATION CREATION ERROR]:', error.message);
    return null;
  }
};
