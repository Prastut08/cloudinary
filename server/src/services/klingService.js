import { requestLumaImageToVideo, checkLumaTaskStatus } from './lumaService.js';

/**
 * Backward-compatibility wrapper pointing Kling AI requests to Luma AI API
 */
export const requestKlingImageToVideo = async (params) => {
  console.log('[Video Service Notice]: Redirecting video generation request to Luma AI engine...');
  return requestLumaImageToVideo(params);
};

export const checkKlingTaskStatus = async (taskId) => {
  return checkLumaTaskStatus(taskId);
};
