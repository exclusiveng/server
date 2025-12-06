import { UploadedFile } from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  uploadDir?: string;
}

export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileUploadError';
  }
}

/**
 * Validates and sanitizes uploaded files
 */
export const validateFile = (
  file: UploadedFile,
  options: FileUploadOptions = {}
): void => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  } = options;

  // Check if file exists
  if (!file) {
    throw new FileUploadError('No file uploaded');
  }

  // Check file size
  if (file.size > maxSize) {
    throw new FileUploadError(
      `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
    );
  }

  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new FileUploadError(
      `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
    );
  }

  // Check file extension matches MIME type
  const ext = path.extname(file.name).toLowerCase();
  const mimeToExt: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
  };

  const validExtensions = mimeToExt[file.mimetype] || [];
  if (!validExtensions.includes(ext)) {
    throw new FileUploadError('File extension does not match file type');
  }

  // Validate file name (prevent path traversal)
  const fileName = path.basename(file.name);
  if (fileName !== file.name || /[<>:"|?*\x00-\x1f]/g.test(fileName)) {
    throw new FileUploadError('Invalid file name');
  }
};

/**
 * Generates a secure random filename
 */
export const generateSecureFileName = (originalName: string): string => {
  const ext = path.extname(originalName).toLowerCase();
  const randomName = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${randomName}${ext}`;
};

/**
 * Ensures upload directory exists
 */
export const ensureUploadDir = (uploadDir: string): void => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

/**
 * Saves uploaded file securely
 */
export const saveUploadedFile = async (
  file: UploadedFile,
  options: FileUploadOptions = {}
): Promise<{ fileName: string; filePath: string; url: string }> => {
  const { uploadDir = path.join(process.cwd(), 'uploads', 'products') } = options;

  // Validate file
  validateFile(file, options);

  // Ensure upload directory exists
  ensureUploadDir(uploadDir);

  // Generate secure file name
  const fileName = generateSecureFileName(file.name);
  const filePath = path.join(uploadDir, fileName);

  // Move file to upload directory
  await file.mv(filePath);

  // Generate URL (adjust based on your server configuration)
  const url = `/uploads/products/${fileName}`;

  return { fileName, filePath, url };
};

/**
 * Deletes a file from the filesystem
 */
export const deleteFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

/**
 * Sanitizes file-related input to prevent exploits
 */
export const sanitizeFileName = (fileName: string): string => {
  // Remove any path traversal attempts
  let sanitized = path.basename(fileName);
  
  // Remove special characters except dots, hyphens, and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const ext = path.extname(sanitized);
    const nameWithoutExt = sanitized.substring(0, maxLength - ext.length);
    sanitized = nameWithoutExt + ext;
  }
  
  return sanitized;
};
