import multer from 'multer';

// Use memory storage to process uploads directly in memory buffer
const storage = multer.memoryStorage();

// File filter function to accept only image formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and GIF images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadSingleAvatar = upload.single('avatar');
export const uploadSingleMedia = upload.single('image');

import fs from 'fs';
import path from 'path';

// Disk storage for executable and binary build artifacts (up to 100MB)
const executableStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads/executables');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.exe';
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

export const uploadSingleExecutable = multer({
  storage: executableStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for executables & binary packages
  },
}).single('executable');
