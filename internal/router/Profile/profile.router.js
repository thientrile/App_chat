




import express from "express";
import { FindUserById, FindUserByPhoneNumber, SendFriendRequest } from "../../controller/Profile/profile.controller.js";
import authertication from "../../../pkg/token/auth.js";
import validateSchema from '../../../pkg/validation/joi.js';
import { inputSendFriendRequest } from "../../validation/Profile.js";
import { asyncHandler } from "../../../pkg/async/asyncHandler.js";
const ProfileRouter = express.Router();
ProfileRouter.use(authertication);
ProfileRouter.post('/send-friend-request',validateSchema(inputSendFriendRequest), asyncHandler(SendFriendRequest));
ProfileRouter.get('/find-user-by-phone/:phone', asyncHandler(FindUserByPhoneNumber));
ProfileRouter.get('/find-user-by-id/:id', asyncHandler(FindUserById));

export default ProfileRouter;