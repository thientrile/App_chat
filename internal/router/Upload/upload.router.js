
import express from "express";
import { asyncHandler } from "../../../pkg/async/asyncHandler.js";
import { uploadImageOptimized, uploadImageStandard } from "../../controller/Upload/upload.controller.js";
import { hybridUpload } from "../../../pkg/multer/multer.js";
import authertication from "../../../pkg/token/auth.js";
const uploadRouter = express.Router();

uploadRouter.use(authertication)
uploadRouter.post('/', hybridUpload, asyncHandler(uploadImageOptimized));
uploadRouter.post('/single', hybridUpload, asyncHandler(uploadImageStandard));

export default uploadRouter;