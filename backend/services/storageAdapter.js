const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists on disk for local fallback
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

class StorageAdapter {
  constructor(uploadsDir = UPLOADS_DIR) {
    this.uploadsDir = uploadsDir;
    this.useCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;
  }

  async saveFile(buffer, originalFilename = 'upload.jpg', mimeType = 'image/jpeg') {
    const ext = path.extname(originalFilename) || (mimeType.includes('png') ? '.png' : '.jpg');
    const uniqueId = crypto.randomBytes(12).toString('hex');
    const filename = `${Date.now()}_${uniqueId}${ext}`;

    if (this.useCloudinary) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'urban_eye', public_id: filename.replace(/\.[^/.]+$/, "") }, 
          (error, result) => {
            if (error) {
              console.error('[Cloudinary] Upload failed:', error);
              return reject(error);
            }
            resolve({
              filename: filename,
              url: result.secure_url,
              fullPath: result.secure_url // In cloud mode, fullPath is same as URL
            });
          }
        );
        uploadStream.end(buffer);
      });
    } else {
      // Local Disk Fallback
      const fullPath = path.join(this.uploadsDir, filename);
      await fs.promises.writeFile(fullPath, buffer);
      const url = `/uploads/${filename}`;
      return {
        filename,
        url,
        fullPath
      };
    }
  }

  async deleteFile(filename) {
    try {
      if (this.useCloudinary) {
        const publicId = `urban_eye/${filename.replace(/\.[^/.]+$/, "")}`;
        await cloudinary.uploader.destroy(publicId);
      } else {
        const fullPath = path.join(this.uploadsDir, filename);
        if (fs.existsSync(fullPath)) {
          await fs.promises.unlink(fullPath);
        }
      }
    } catch (err) {
      console.warn(`[StorageAdapter] Failed to delete file ${filename}:`, err.message);
    }
  }

  exists(filename) {
    if (this.useCloudinary) {
      return true; // We assume it exists on cloud, as checking requires an API call
    }
    return fs.existsSync(path.join(this.uploadsDir, filename));
  }
}

const storageAdapter = new StorageAdapter();
module.exports = storageAdapter;

