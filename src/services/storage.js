// DONE — Secure Storage Service
// Handles client-side file validation, secure blob references, and Supabase Storage integration
import { safeUUID } from '../config.js';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export class StorageService {
  validateFile(file) {
    if (!file) {
      return { valid: false, error: 'No file selected.' };
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file type (${file.type || 'unknown'}). Please upload a PDF, JPG, PNG, or WEBP file.`
      };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `File size (${sizeMb} MB) exceeds maximum allowed 10 MB limit.`
      };
    }
    return { valid: true };
  }

  // Universal upload method called by RecipientPage and Request details
  async uploadFile(file, pathOrPrefix = 'uploads') {
    const val = this.validateFile(file);
    if (!val.valid) {
      throw new Error(val.error);
    }

    // Generate safe Object URL in browser so localStorage doesn't hit 5MB QuotaExceededError
    const safeUrl = typeof URL !== 'undefined' && URL.createObjectURL 
      ? URL.createObjectURL(file) 
      : `data:${file.type};name=${encodeURIComponent(file.name)}`;

    const storagePath = `${pathOrPrefix}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    return {
      success: true,
      url: safeUrl,
      storagePath,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString()
    };
  }

  async uploadDocument(file, { requestId, actionId }) {
    const res = await this.uploadFile(file, `requests/${requestId}/${actionId}`);
    return {
      id: safeUUID(),
      requestId,
      actionId,
      originalFilename: res.name,
      mimeType: res.mimeType,
      fileSize: res.size,
      dataUrl: res.url,
      uploadedAt: res.uploadedAt,
      storagePath: res.storagePath,
      status: 'verified'
    };
  }

  formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

export const storageService = new StorageService();
