import { generateImageToVideo as lumaGenerate, getLumaTaskStatus as lumaTaskStatus, getLumaHistory as lumaHistory } from './lumaController.js';

export const generateImageToVideo = lumaGenerate;
export const getKlingTaskStatus = lumaTaskStatus;
export const getKlingHistory = lumaHistory;
