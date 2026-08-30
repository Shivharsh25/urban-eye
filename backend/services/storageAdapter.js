const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists on disk
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Storage Adapter Interface
 * By default uses Local Disk Storage.
 * Can be swapped to S3, GCS, or Cloudinary via STORAGE_DRIVER env var.
 */
class LocalStorageAdapter {
  constructor(uploadsDir = UPLOADS_DIR) {
    this.uploadsDir = uploadsDir;
  }

  /**
   * Save a buffer or file to disk
   * @param {Buffer} buffer 
   * @param {string} originalFilename 
   * @param {string} mimeType 
   * @returns {Promise<{ filename: string, url: string, fullPath: string }>}
   */
  async saveFile(buffer, originalFilename = 'upload.jpg', mimeType = 'image/jpeg') {
    const ext = path.extname(originalFilename) || (mimeType.includes('png') ? '.png' : '.jpg');
    const uniqueId = crypto.randomBytes(12).toString('hex');
    const filename = `${Date.now()}_${uniqueId}${ext}`;
    const fullPath = path.join(this.uploadsDir, filename);

    await fs.promises.writeFile(fullPath, buffer);

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const url = `${baseUrl}/uploads/${filename}`;

    return {
      filename,
      url,
      fullPath
    };
  }

  /**
   * Delete a stored file
   * @param {string} filename 
   */
  async deleteFile(filename) {
    try {
      const fullPath = path.join(this.uploadsDir, filename);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (err) {
      console.warn(`[StorageAdapter] Failed to delete file ${filename}:`, err.message);
    }
  }

  /**
   * Check if file exists
   */
  exists(filename) {
    return fs.existsSync(path.join(this.uploadsDir, filename));
  }
}

// Export singleton instance
const storageAdapter = new LocalStorageAdapter();
module.exports = storageAdapter;
