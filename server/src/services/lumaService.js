import dotenv from 'dotenv';
dotenv.config();

const LUMA_BASE_URL = process.env.LUMA_BASE_URL || 'https://api.lumalabs.ai/dream-machine/v1';

/**
 * Get Luma API key from environment variables
 */
const getLumaApiKey = () => {
  return (process.env.LUMA_API_KEY || '').trim();
};

/**
 * Submit an Image-to-Video generation task to Luma AI (Dream Machine API)
 */
export const requestLumaImageToVideo = async ({
  imageUrl,
  prompt,
  aspectRatio = '16:9',
  loop = false,
}) => {
  const apiKey = getLumaApiKey();

  if (!apiKey) {
    throw new Error('LUMA_API_KEY is not configured in server environment.');
  }

  const payload = {
    prompt: prompt || 'Animate this product image with smooth cinematic motion',
    model: 'ray-2',
    aspect_ratio: aspectRatio || '16:9',
    loop: Boolean(loop),
    keyframes: {
      frame0: {
        type: 'image',
        url: imageUrl,
      },
    },
  };

  console.log('[Luma AI Service] Submitting Generation to', `${LUMA_BASE_URL}/generations`);
  console.log('[Luma AI Service] Model: ray-2 | Ratio:', payload.aspect_ratio, '| Image URL:', imageUrl);

  const response = await fetch(`${LUMA_BASE_URL}/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || data.failure_reason || data.message || data.error || `Luma API error (status ${response.status})`;
    console.warn('[Luma AI API Notice]: Response error —', errorMsg, '| Status:', response.status);
    throw new Error(errorMsg);
  }

  return data;
};

/**
 * Check task status of a Luma AI video generation task by ID
 */
export const checkLumaTaskStatus = async (generationId) => {
  const apiKey = getLumaApiKey();

  if (!apiKey) {
    throw new Error('LUMA_API_KEY is not configured.');
  }

  const response = await fetch(`${LUMA_BASE_URL}/generations/${generationId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || data.failure_reason || data.message || `Luma status check error (${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
};
