import multer from 'multer';
import path from 'path';

// Memory storage to stream directly to Cloudinary without writing to disk
const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only JPG, PNG, and WEBP images are allowed.'), false);
  }
};

export const uploadSingleImage = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  },
  fileFilter
}).single('image');

const allowedVideoMimeTypes = [
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg', 'video/3gpp', 'video/ogg'
];

const videoFileFilter = (req, file, cb) => {
  if (allowedVideoMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported video type. Only MP4, MOV, AVI, WEBM, and standard video formats are allowed.'), false);
  }
};

export const uploadSingleVideo = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for video upload
  },
  fileFilter: videoFileFilter
}).single('video');

