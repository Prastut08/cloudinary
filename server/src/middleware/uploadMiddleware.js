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
