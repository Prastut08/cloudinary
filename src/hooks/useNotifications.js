import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for User-Isolated Realtime Firestore Notifications
 * 
 * Enforces:
 * - Querying ONLY notifications where userId == currentUser.uid
 * - Automatic subscription cleanup on logout or unmount
 * - User isolation (switching accounts completely unsubscribes old listener and resets state)
 */
export function useNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no authenticated user, clear state and return early
    if (!currentUser || !currentUser.uid) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Build user-isolated query limited to latest 30 notifications
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(30)
    );

    // Realtime Firestore Listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        let unread = 0;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.read) unread++;

          items.push({
            id: docSnap.id,
            ...data,
            // Format Firestore Timestamp or fallback string safely
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
          });
        });

        setNotifications(items);
        setUnreadCount(unread);
        setLoading(false);
      },
      (err) => {
        console.error('[NOTIFICATIONS LISTENER ERROR]:', err);
        setError('Failed to sync notifications.');
        setLoading(false);
      }
    );

    // Cleanup listener on unmount or user switch
    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  /**
   * Mark a single notification as read (Strictly verified against currentUser.uid)
   */
  const markAsRead = async (notificationId) => {
    if (!currentUser?.uid || !notificationId) return;

    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (err) {
      console.error('[MARK AS READ ERROR]:', err);
      setError('Could not mark notification as read.');
    }
  };

  /**
   * Mark ALL unread notifications for current user as read via Firestore Batch
   */
  const markAllAsRead = async () => {
    if (!currentUser?.uid || notifications.length === 0) return;

    const unreadItems = notifications.filter((n) => !n.read);
    if (unreadItems.length === 0) return;

    try {
      const batch = writeBatch(db);
      unreadItems.forEach((item) => {
        const ref = doc(db, 'notifications', item.id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('[MARK ALL AS READ ERROR]:', err);
      setError('Could not mark all notifications as read.');
    }
  };

  /**
   * Delete a notification belonging to current user
   */
  const deleteNotification = async (notificationId) => {
    if (!currentUser?.uid || !notificationId) return;

    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notifRef);
    } catch (err) {
      console.error('[DELETE NOTIFICATION ERROR]:', err);
      setError('Could not delete notification.');
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

/**
 * Format relative time helper ("Just now", "5m ago", "2h ago", etc.)
 */
export function formatRelativeTime(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Just now';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
