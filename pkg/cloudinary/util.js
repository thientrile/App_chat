import cloudinary from './cloudinary.js';
import { Readable } from 'stream';
import fs from 'fs';
import sharp from 'sharp';
import { randomId } from '../utils/index.utils.js';

// Standard stream upload (cho files nhỏ)
export const streamUpload = (buffer, publicId, folder, tags = []) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder,
        resource_type: 'auto',
        tags,
        timeout: 300000, // 5 minutes timeout
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(stream);
  });
};

// Large file upload với chunked upload (cho files >100MB)
export const uploadLargeFile = (filePath, publicId, folder, tags = []) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      filePath,
      {
        public_id: publicId,
        folder,
        resource_type: 'auto',
        tags,
        chunk_size: 20000000, // 20MB chunks
        timeout: 600000, // 10 minutes timeout for large files
        // Optimization options
        quality: 'auto:good',
        fetch_format: 'auto',
        flags: 'progressive'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
};

// Compress image trước khi upload (cho images lớn)
export const compressImage = async (inputBuffer, quality = 80) => {
  try {
    const compressed = await sharp(inputBuffer)
      .jpeg({
        quality,
        progressive: true,
        mozjpeg: true
      })
      .withMetadata()
      .toBuffer();

    const originalSize = inputBuffer.length;
    const compressedSize = compressed.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

    console.log(`🗜️ Image compressed: ${Math.round(originalSize / 1024 / 1024)}MB → ${Math.round(compressedSize / 1024 / 1024)}MB (${compressionRatio}% reduction)`);

    return compressed;
  } catch (error) {
    console.warn('⚠️ Image compression failed, using original:', error.message);
    return inputBuffer;
  }
};

// Optimized upload với auto compression
export const optimizedUpload = async (input, publicId, folder, tags = [], options = {}) => {
  const {
    compress = true,
    quality = 80,
    maxSize = 50 * 1024 * 1024 // 50MB threshold for compression
  } = options;

  try {
    let processedInput = input;
    let isBuffer = Buffer.isBuffer(input);
    let inputSize = isBuffer ? input.length : fs.statSync(input).size;

    // Auto compression cho images lớn
    if (compress && isBuffer && inputSize > maxSize) {
      try {
        processedInput = await compressImage(input, quality);
        console.log(`📸 Large image auto-compressed before upload`);
      } catch (compressError) {
        console.warn('⚠️ Compression failed, uploading original');
      }
    }

    // Choose upload method based on size and type
    if (isBuffer) {
      return await streamUpload(processedInput, publicId, folder, tags);
    } else {
      // File path - use large file upload
      return await uploadLargeFile(input, publicId, folder, tags);
    }
  } catch (error) {
    console.error('❌ Optimized upload failed:', error);
    throw error;
  }
};

// Batch upload với concurrency control
export const batchUpload = async (files, folder, tags = [], options = {}) => {
  const {
    concurrency = 3, // Upload 3 files at once
    compress = true,
    onProgress = null
  } = options;

  const results = [];
  const errors = [];
  let completed = 0;

  // Process files in batches
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);

    const batchPromises = batch.map(async (file, index) => {
      try {
        const publicId = randomId ? randomId() : `img_${Date.now()}_${i + index}`;
        const input = file.buffer || file.path;

        console.log(`📤 Uploading ${file.originalname || file} (${Math.round((file.size || 0) / 1024 / 1024)}MB)`);

        const startTime = Date.now();
        const result = await optimizedUpload(input, publicId, folder, tags, { compress });
        const uploadTime = Date.now() - startTime;

        console.log(`✅ Uploaded ${file.originalname || file} in ${uploadTime}ms`);

        // Clean up disk file if exists
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        completed++;
        if (onProgress) {
          onProgress(completed, files.length, result);
        }

        return result;
      } catch (error) {
        console.error(`❌ Failed to upload ${file.originalname || file}:`, error.message);

        // Clean up disk file if exists
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        errors.push({ file: file.originalname || file, error: error.message });
        return null;
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean));

    // Small delay between batches to prevent overwhelming
    if (i + concurrency < files.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    results,
    errors,
    totalUploaded: results.length,
    totalErrors: errors.length
  };
};

// Progress tracking cho single file
export const uploadWithProgress = async (input, publicId, folder, tags = [], onProgress = null) => {
  console.log('🚀 Starting upload with progress tracking...');

  const startTime = Date.now();
  let lastProgress = 0;

  // Simulate progress updates (since Cloudinary doesn't provide real progress)
  const progressInterval = setInterval(() => {
    lastProgress = Math.min(lastProgress + Math.random() * 20, 90);
    if (onProgress) {
      onProgress(Math.round(lastProgress));
    }
  }, 500);

  try {
    const result = await optimizedUpload(input, publicId, folder, tags);

    clearInterval(progressInterval);
    if (onProgress) onProgress(100);

    const uploadTime = Date.now() - startTime;
    console.log(`✅ Upload completed in ${uploadTime}ms`);

    return result;
  } catch (error) {
    clearInterval(progressInterval);
    throw error;
  }
};

