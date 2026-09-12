import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Creates a sample product document in Firestore under 'products' collection.
 * Enforces user isolation by attaching userId equal to auth.currentUser.uid.
 */
export const createTestProduct = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to create a product document.');
  }

  const newProduct = {
    userId,
    name: 'Sample Leather Wallet',
    category: 'Accessories',
    originalAsset: null,
    tags: ['leather', 'wallet', 'minimalist'],
    moderationStatus: 'Passed',
    processingStatus: 'draft',
    assets: {
      ecommerce: [],
      social: [],
      web: []
    },
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'products'), newProduct);
  return { id: docRef.id, ...newProduct };
};
