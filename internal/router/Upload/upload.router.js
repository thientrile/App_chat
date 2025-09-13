
import express from "express";
import { asyncHandler } from "../../../pkg/async/asyncHandler.js";
import { UploadFileMsg } from "../../controller/Upload/upload.controller.js";
import { hybridUpload } from "../../../pkg/multer/multer.js";
import authertication from "../../../pkg/token/auth.js";
const uploadRouter = express.Router();

uploadRouter.use(authertication)
uploadRouter.post('/msg', hybridUpload, asyncHandler(UploadFileMsg));

export default uploadRouter;