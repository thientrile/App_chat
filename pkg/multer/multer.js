/** @format */

'use strict';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = 'storage/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage với limits tối ưu cho files lớn
export const updloadMemory = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
        files: 50, // Maximum 50 files at once
        parts: 1000, // Maximum form parts
        headerPairs: 2000 // Maximum header pairs
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff', 'video/mp4', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not supported. Allowed: JPEG, PNG, GIF, WebP, TIFF, MP4, MOV'), false);
        }
    }
});

// Disk storage để handle files cực lớn (>100MB)
export const uploadDisk = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            cb(null, `${uniqueSuffix}${extension}`);
        }
    }),
    limits: {
        fileSize: 1024 * 1024 * 1024, // 1GB limit for disk storage
        files: 25 // Maximum 25 large files at once
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff', 'video/mp4', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not supported. Allowed: JPEG, PNG, GIF, WebP, TIFF, MP4, MOV'), false);
        }
    }
});

// Hybrid storage - chọn memory hoặc disk based on file size
export const hybridUpload = (req, res, next) => {
    // Middleware để detect file size và route accordingly
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const threshold = 100 * 1024 * 1024; // 100MB threshold

    if (contentLength > threshold) {
        console.log(`📁 Large file detected (${Math.round(contentLength / 1024 / 1024)}MB), using disk storage`);
        return uploadDisk.array('files', 25)(req, res, next);
    } else {
        console.log(`💾 Small file detected (${Math.round(contentLength / 1024 / 1024)}MB), using memory storage`);
        return updloadMemory.array('files', 50)(req, res, next);
    }
};

export default { updloadMemory, uploadDisk, hybridUpload };
