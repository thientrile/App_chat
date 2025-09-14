import { BadRequestError } from "../../../pkg/response/error.js";
import { randomId } from "../../../pkg/utils/index.utils.js";

// Import CJS cloudinary utils in ESM
import { findRoomById } from "../../repository/room.reop.js";
import { IO } from "../../../global.js";
import { optimizedUpload } from "../../../pkg/cloudinary/util.js";
import messageMode from "../../model/message.mode.js";
import cloudinary from "../../../pkg/cloudinary/cloudinary.js";

// const { optimizedUpload, batchUpload } = cloudinaryUtil || {};

// Build attachment DTO in the shape required by Message.msg_attachments
const toAttachmentDTO = (uploadResult, override = {}) => {
    const resourceType = uploadResult?.resource_type || "image";
    const format = uploadResult?.format || "";
    const kind = resourceType === "image" ? "image" : (resourceType === "video" ? "video" : "file");
    const url = uploadResult?.secure_url || uploadResult?.url;
    const name = override.name || uploadResult?.original_filename || uploadResult?.public_id || undefined;
    const size = override.size ?? uploadResult?.bytes ?? undefined;
    const mimeType = override.mimeType || (format ? `${resourceType}/${format}` : undefined);

    // Generate a lightweight thumb URL for images using Cloudinary transformation if possible
    let thumbUrl = override.thumbUrl;
    if (!thumbUrl && url && resourceType === "image") {
        // Insert a simple transformation segment. Only works for Cloudinary URLs.
        // Example: https://res.cloudinary.com/<cloud>/image/upload/<transforms>/<path>
        try {
            thumbUrl = url.replace("/upload/", "/upload/c_fill,f_auto,q_auto,w_300,h_300/");
        } catch { }
    }

    const dto = {
        kind,
        url,
        name,
        size,
        mimeType,
        thumbUrl,
        status: override.status || "uploaded",
    };

    if (resourceType === "image") {
        if (typeof uploadResult?.width === "number") dto.width = uploadResult.width;
        if (typeof uploadResult?.height === "number") dto.height = uploadResult.height;
    }
    if (resourceType === "video") {
        if (typeof uploadResult?.duration === "number") dto.duration = uploadResult.duration;
    }
    return dto;
};
// xử lý gửi msg kèm file
export const uploadMsg= async (userId, payload) => {
    const { files, roomId, msgId } = payload;
    console.log("🚀 ~ uploadImages ~ files count:", files?.length);
    const room = await findRoomById(roomId);
    if (!room) {
        throw new BadRequestError("Room not found");
    }
    // const findAlbum = await albumModel.findOne({ alb_id: albumId }).lean();
    if (!files?.length) {
        throw new BadRequestError('No images found in request');
    }

    // Calculate total size để chọn strategy
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    const averageSize = totalSize / files.length;
    const isLargeUpload = totalSize > 100 * 1024 * 1024; // 100MB total
    const hasLargeFiles = files.some(file => (file.size || 0) > 50 * 1024 * 1024); // 50MB per file

    console.log(`📊 Upload stats: ${files.length} files, ${Math.round(totalSize / 1024 / 1024)}MB total, ${Math.round(averageSize / 1024 / 1024)}MB average`);

    try {
        let uploadResults;

        if (isLargeUpload || hasLargeFiles) {
            // Use optimized batch upload for large files
            console.log('🚀 Using optimized batch upload for large files');

            const batchResult = await batchUpload(
                files,
                `appChat/${room.room_id}`,
                {
                    concurrency: hasLargeFiles ? 2 : 3, // Reduce concurrency for very large files
                    compress: true,
                    onProgress: (completed, total, result) => {
                        console.log(`📤 Progress: ${completed}/${total} files uploaded`);
                    }
                }
            );

            if (batchResult.errors.length > 0) {
                console.warn('⚠️ Some files failed to upload:', batchResult.errors);
            }

            uploadResults = batchResult.results;

            if (uploadResults.length === 0) {
                throw new BadRequestError('All files failed to upload');
            }
        } else {
            // Use standard Promise.all for smaller files
            console.log('💨 Using standard parallel upload for small files');

            uploadResults = await Promise.all(
                files.map(async (file, index) => {
                    try {
                        const publicId = randomId();
                        const input = file.buffer || file.path;

                        return await optimizedUpload(
                            input,
                            publicId,
                            `appChat/${room.room_id}`,
                            { compress: true, quality: 85 }
                        );
                    } catch (error) {
                        console.error(`❌ Failed to upload file ${index}:`, error.message);
                        throw error;
                    }
                })
            );
        }

        // 2. Map to attachment DTO result as required by Message.msg_attachments
        const attachments = uploadResults.map((res, idx) => {
            const original = files[idx];
            return toAttachmentDTO(res, {
                name: original?.originalname,
                size: original?.size,
                mimeType: original?.mimetype,
            });
        });



        // Return the shaped attachments for the client to use in Message.msg_attachments
        const rmId = room.room_id.includes(".") ? room.room_id.replace(".", "").replace(roomId, "") : roomId;
        // update is message

        await messageMode.updateOne(
            { msg_id: msgId, msg_room: room._id },
            { $push: { msg_attachments: { $each: attachments } } }
        );
        global.IO.to(room.room_id).emit('updated:attachments', { roomId: rmId, msgId, attachments, sendRoomId: roomId });
        return {
            count: attachments.length,
            attachments,
        };

    } catch (err) {
        console.error('❌ Upload error:', err);

        // Enhanced error reporting
        if (err.message.includes('timeout')) {
            throw new BadRequestError('Upload timeout - files too large or connection too slow');
        } else if (err.message.includes('Invalid image')) {
            throw new BadRequestError('Invalid image format or corrupted file');
        } else if (err.message.includes('File too large')) {
            throw new BadRequestError('File size exceeds limit (500MB per file)');
        }

        throw new BadRequestError(`Upload failed: ${err.message}`);
    }
};


export const uploadImage = async (userId, payload) => {
    try {
        const { files } = payload;
        console.log("🚀 ~ uploadImage ~ files:", files);

        let uploadInput;
        if (files[0].buffer) {
            // Convert buffer to base64 data URI
            const mimeType = files[0].mimetype || 'image/jpeg';
            const base64 = files[0].buffer.toString('base64');
            uploadInput = `data:${mimeType};base64,${base64}`;
        } else if (files[0].path) {
            uploadInput = files[0].path;
        } else {
            throw new BadRequestError('No valid file input');
        }

        const result = await cloudinary.uploader.upload(uploadInput, {
            folder: `/avatars/${userId}`,
            public_id: randomId(),
            resource_type: "auto"
        });
        return {
            ...result,
            url: result.secure_url || result.url
        };
    } catch (err) {
        console.error('Error uploading image::', err);
        throw new BadRequestError('Error uploading image');
    }
};

export default {
    uploadMsg,
    uploadImage
};
