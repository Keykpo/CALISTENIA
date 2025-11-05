import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { logError, logInfo } from '../config/logger';
import { ApiError } from './errorHandler';

// File type definitions
export interface FileUploadOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  destination?: string;
  filename?: (req: Request, file: Express.Multer.File) => string;
  compress?: boolean;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

// Default file upload options
const defaultOptions: FileUploadOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf',
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.pdf'],
  destination: config.fileStorage.uploadPath,
  compress: true,
  quality: 80,
  maxWidth: 1920,
  maxHeight: 1080,
};

// Create upload directory if it doesn't exist
const ensureUploadDir = async (dir: string): Promise<void> => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// File filter function
const createFileFilter = (options: FileUploadOptions) => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
    const { allowedMimeTypes, allowedExtensions } = { ...defaultOptions, ...options };
    
    // Check MIME type
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
      return cb(new ApiError(`File type ${file.mimetype} is not allowed`, 400));
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions && !allowedExtensions.includes(ext)) {
      return cb(new ApiError(`File extension ${ext} is not allowed`, 400));
    }

    cb(null, true);
  };
};

// Storage configuration
const createStorage = (options: FileUploadOptions) => {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      const dest = options.destination || defaultOptions.destination!;
      await ensureUploadDir(dest);
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      if (options.filename) {
        return cb(null, options.filename(req, file));
      }
      
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  });
};

// Create multer upload middleware
export const createUploadMiddleware = (options: FileUploadOptions = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  
  return multer({
    storage: createStorage(mergedOptions),
    fileFilter: createFileFilter(mergedOptions),
    limits: {
      fileSize: mergedOptions.maxSize,
      files: 10, // Maximum 10 files per request
    },
  });
};

// Image compression middleware
export const compressImage = (options: {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
} = {}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file && !req.files) {
        return next();
      }

      const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file!];
      
      for (const file of files) {
        if (!file || !file.mimetype.startsWith('image/')) {
          continue;
        }

        const {
          quality = 80,
          maxWidth = 1920,
          maxHeight = 1080,
          format = 'jpeg',
        } = options;

        const inputPath = file.path;
        const outputPath = inputPath.replace(path.extname(inputPath), `.${format}`);

        // Compress and resize image
        await sharp(inputPath)
          .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: format === 'jpeg' ? quality : undefined })
          .png({ quality: format === 'png' ? quality : undefined })
          .webp({ quality: format === 'webp' ? quality : undefined })
          .toFile(outputPath);

        // Update file information
        const stats = await fs.stat(outputPath);
        file.path = outputPath;
        file.filename = path.basename(outputPath);
        file.size = stats.size;

        // Remove original file if different
        if (inputPath !== outputPath) {
          await fs.unlink(inputPath);
        }

        logInfo('Image compressed successfully', {
          originalSize: file.size,
          newSize: stats.size,
          filename: file.filename,
        });
      }

      next();
    } catch (error) {
      logError('Image compression failed', error as Error);
      next(error);
    }
  };
};

// File validation middleware
export const validateFile = (options: {
  required?: boolean;
  maxFiles?: number;
  minFiles?: number;
} = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { required = false, maxFiles = 10, minFiles = 0 } = options;
    
    const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : (req.file ? [req.file] : []);
    
    if (required && files.length === 0) {
      return next(new ApiError('At least one file is required', 400));
    }

    if (files.length > maxFiles) {
      return next(new ApiError(`Maximum ${maxFiles} files allowed`, 400));
    }

    if (files.length < minFiles) {
      return next(new ApiError(`Minimum ${minFiles} files required`, 400));
    }

    next();
  };
};

// Clean up uploaded files on error
export const cleanupFiles = (req: Request, res: Response, next: NextFunction): void => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If response is an error, clean up uploaded files
    if (res.statusCode >= 400) {
      const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : (req.file ? [req.file] : []);
      
      files.forEach(async (file) => {
        try {
          await fs.unlink(file.path);
          logInfo('Cleaned up uploaded file after error', { filename: file.filename });
        } catch (error) {
          logError('Failed to clean up uploaded file', error as Error, { filename: file.filename });
        }
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Predefined upload middlewares for common use cases

// Profile picture upload
export const profilePictureUpload = createUploadMiddleware({
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  destination: path.join(config.fileStorage.uploadPath, 'profiles'),
  filename: (req, file) => {
    const userId = req.user?.id || 'anonymous';
    const ext = path.extname(file.originalname);
    return `profile_${userId}_${Date.now()}${ext}`;
  },
});

// Exercise media upload
export const exerciseMediaUpload = createUploadMiddleware({
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm'],
  destination: path.join(config.fileStorage.uploadPath, 'exercises'),
  filename: (req, file) => {
    const exerciseId = req.params.exerciseId || req.body.exerciseId || 'new';
    const ext = path.extname(file.originalname);
    return `exercise_${exerciseId}_${Date.now()}${ext}`;
  },
});

// Course content upload
export const courseContentUpload = createUploadMiddleware({
  maxSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf',
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm', '.pdf'],
  destination: path.join(config.fileStorage.uploadPath, 'courses'),
  filename: (req, file) => {
    const courseId = req.params.courseId || req.body.courseId || 'new';
    const ext = path.extname(file.originalname);
    return `course_${courseId}_${Date.now()}${ext}`;
  },
});

// General document upload
export const documentUpload = createUploadMiddleware({
  maxSize: 20 * 1024 * 1024, // 20MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
  destination: path.join(config.fileStorage.uploadPath, 'documents'),
});

// Avatar upload with compression
export const avatarUpload = [
  profilePictureUpload.single('avatar'),
  compressImage({
    quality: 85,
    maxWidth: 400,
    maxHeight: 400,
    format: 'webp',
  }),
];

// Exercise images with compression
export const exerciseImagesUpload = [
  exerciseMediaUpload.array('images', 5),
  compressImage({
    quality: 80,
    maxWidth: 1200,
    maxHeight: 800,
    format: 'webp',
  }),
];

// Course thumbnail upload
export const courseThumbnailUpload = [
  courseContentUpload.single('thumbnail'),
  compressImage({
    quality: 85,
    maxWidth: 800,
    maxHeight: 600,
    format: 'webp',
  }),
];

export default {
  createUploadMiddleware,
  compressImage,
  validateFile,
  cleanupFiles,
  profilePictureUpload,
  exerciseMediaUpload,
  courseContentUpload,
  documentUpload,
  avatarUpload,
  exerciseImagesUpload,
  courseThumbnailUpload,
};