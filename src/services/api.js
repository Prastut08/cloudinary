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

/**
 * GET /api/products/assets/search
 * Query backend Cloudinary Search API and Firestore asset catalog with query params
 */
export const searchAssets = async (params = {}) => {
  const token = await getIdToken();
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.append('q', params.q);
  if (params.category && params.category !== 'All') searchParams.append('category', params.category);
  if (params.platform && params.platform !== 'All') searchParams.append('platform', params.platform);
  if (params.productId && params.productId !== 'All') searchParams.append('productId', params.productId);
  if (params.limit) searchParams.append('limit', params.limit);

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/products/assets/search${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to search assets.');
  }

  return response.json();
};

/**
 * PATCH /api/products/:id
 * Rename user product
 */
export const renameProduct = async (id, name, category) => {
  const token = await getIdToken();
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, category })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to rename product.');
  }

  return response.json();
};

/**
 * DELETE /api/products/:id
 * Delete product and Cloudinary folder assets
 */
export const deleteProduct = async (id) => {
  const token = await getIdToken();
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete product.');
  }

  return response.json();
};

/**
 * POST /api/products/:id/share
 * Generate share token for product
 */
export const createProductShare = async (id) => {
  const token = await getIdToken();
  const response = await fetch(`${API_BASE_URL}/products/${id}/share`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create share link.');
  }

  return response.json();
};

/**
 * GET /api/products/share/:shareToken
 * Fetch public shared product details
 */
export const fetchPublicShare = async (shareToken) => {
  const response = await fetch(`${API_BASE_URL}/products/share/${shareToken}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load shared product.');
  }
  return response.json();
};

/**
 * DELETE /api/products/:id/assets/:variantKey
 * Remove target asset variant
 */
export const deleteSingleAsset = async (id, variantKey) => {
  const token = await getIdToken();
  const response = await fetch(`${API_BASE_URL}/products/${id}/assets/${variantKey}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete asset.');
  }

  return response.json();
};

/**
 * POST /api/products/:id/share/toggle
 * Enable or disable product sharing link
 */
export const toggleProductShareState = async (id, enabled) => {
  const token = await getIdToken();
  const response = await fetch(`${API_BASE_URL}/products/${id}/share/toggle`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ enabled })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to toggle share state.');
  }

  return response.json();
};

/**
 * GET /api/products/:id/download
 * Download ZIP archive containing all product assets
 */
export const downloadProductZipArchive = async (id, productName = 'product') => {
  const token = await getIdToken();
  const response = await fetch(`${API_BASE_URL}/products/${id}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to generate ZIP archive.');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  const safeName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  a.download = `${safeName}-assets.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
