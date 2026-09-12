import { auth } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Get current authenticated user ID token from Firebase Auth
 */
const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User is not authenticated. Please log in.');
  }
  return await user.getIdToken();
};

/**
 * Fetch backend health status
 */
export const fetchHealthStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
};

/**
 * Safely verify Cloudinary connectivity via Express backend
 */
export const checkCloudinaryBackendStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/cloudinary/status`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to verify Cloudinary status');
  }
  return response.json();
};

/**
 * GET /api/products
 * Retrieve all real products for the authenticated user from Firestore via Express
 */
export const fetchProducts = async () => {
  const token = await getIdToken();
  const response = await fetch(`${API_BASE_URL}/products`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user products.');
  }

  return response.json();
};

/**
 * POST /api/products/upload
 * Send product details and raw image file to Express backend with Bearer Token
 */
export const uploadProductMedia = async (name, category, file) => {
  const token = await getIdToken();
  const formData = new FormData();
  formData.append('name', name);
  formData.append('category', category);
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/products/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload and process product media.');
  }

  return response.json();
};

/**
 * GET /api/products/:id
 * Retrieve real product document with user ownership verification
 */
export const fetchProductById = async (id) => {
  const token = await getIdToken();
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch product details.');
  }

  return response.json();
};

/**
 * POST /api/products/:id/regenerate-asset
 * Regenerate single target asset URL without re-uploading master image
 */
export const regenerateSingleAsset = async (id, variantKey) => {
  const token = await getIdToken();
  const response = await fetch(`${API_BASE_URL}/products/${id}/regenerate-asset`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ variantKey })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to regenerate single asset.');
  }

  return response.json();
};
