import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file client-side before multipart upload
 * Caps max dimension to ~1600px and targets ~80% JPEG quality.
 * @param {File} file 
 * @returns {Promise<File>}
 */
export async function compressImageClientSide(file) {
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  const options = {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: 'image/jpeg'
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // Create new File with proper name and timestamp
    const compressedFile = new File(
      [compressedBlob],
      file.name.replace(/\.[^/.]+$/, "") + ".jpg",
      { type: 'image/jpeg', lastModified: Date.now() }
    );
    console.log(`[ImageCompressor] Original: ${(file.size / 1024).toFixed(1)} KB -> Compressed: ${(compressedFile.size / 1024).toFixed(1)} KB`);
    return compressedFile;
  } catch (error) {
    console.warn('[ImageCompressor] Fallback: using original image due to compression error:', error.message);
    return file;
  }
}
