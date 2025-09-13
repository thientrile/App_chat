import { BadRequestError } from "../../../pkg/response/error.js";
import { uploadMsg } from "../../service/Upload/upload.service.js";
import { SuccessReponse } from "../../../pkg/response/success.js";


export const UploadFileMsg = async (req, res) => {
    const { files } = req;
    console.log("🚀 ~ UploadFileMsg ~ files:", files)
    req.body.files = files;
    
    if (!files || files.length === 0) {
        throw new BadRequestError('Please upload at least one image');
    }

    // Check file sizes và recommendations
    const largeFiles = files.filter(f => (f.size || 0) > 50 * 1024 * 1024);
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    
    let recommendations = [];
    if (largeFiles.length > 0) {
        recommendations.push(`${largeFiles.length} file(s) are very large (>50MB). Consider compressing before upload.`);
    }
    if (totalSize > 200 * 1024 * 1024) {
        recommendations.push('Total size >200MB. Upload may take several minutes.');
    }

    console.log(`📊 Upload analysis: ${files.length} files, ${Math.round(totalSize/1024/1024)}MB, ${largeFiles.length} large files`);

    const startTime = Date.now();
    const result = await uploadMsg(req.decoded.userId, req.body);
    const uploadTime = Date.now() - startTime;

    new SuccessReponse({
        message: `Successfully uploaded ${result.length} image(s) with optimization`,
        metadata: {
            result,
            uploadStats: {
                totalFiles: files.length,
                successfulUploads: result.length,
                uploadTime: `${uploadTime}ms`,
                totalSize: `${Math.round(totalSize/1024/1024)}MB`,
                averageTimePerFile: `${Math.round(uploadTime/files.length)}ms`,
                recommendations
            }
        }
    }).send(res);
}


export const uploadImageStandard = async (req, res) => {
    const { files } = req;
    req.body.files = files;
    if (!files || files.length === 0) {
        throw new BadRequestError('Please upload at least one image');
    }
    const result = await uploadImage(req.decoded.userId, req.body);
    new SuccessReponse({
        message: `Successfully uploaded ${result.length} image(s)`,
        metadata: result
    }).send(res);
}