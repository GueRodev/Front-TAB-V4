/**
 * File Validation Helpers
 * Reusable utilities for file validation and processing
 */

import { FILE_UPLOAD_CONFIG } from '@/config/app.config';

/**
 * Validate file type against allowed types
 */
export const validateFileType = (file: File): boolean => {
  return ([...FILE_UPLOAD_CONFIG.allowedTypes] as string[]).includes(file.type);
};

/**
 * Validate file size against maximum allowed size
 */
export const validateFileSize = (file: File): boolean => {
  return file.size <= FILE_UPLOAD_CONFIG.maxSize;
};

/**
 * Read file as base64 data URL
 */
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result as string;
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
};
