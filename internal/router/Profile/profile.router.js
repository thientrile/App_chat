




import express from "express";
import { AcceptFriendRequest, FindUserById, FindUserByPhoneNumber, GetListFriends, RejectFriendRequest, SendFriendRequest } from "../../controller/Profile/profile.controller.js";
import authertication from "../../../pkg/token/auth.js";
import validateSchema from '../../../pkg/validation/joi.js';
import { inputSendFriendRequest } from "../../validation/Profile.js";
import { asyncHandler } from "../../../pkg/async/asyncHandler.js";
const ProfileRouter = express.Router();
ProfileRouter.use(authertication);
ProfileRouter.post('/send-friend-request',validateSchema(inputSendFriendRequest), asyncHandler(SendFriendRequest));
ProfileRouter.get('/find-user-by-phone/:phone', asyncHandler(FindUserByPhoneNumber));
ProfileRouter.get('/find-user-by-id/:id', asyncHandler(FindUserById));
ProfileRouter.get('/accept-friend-request/:id', asyncHandler(AcceptFriendRequest));
ProfileRouter.get('/reject-friend-request/:id', asyncHandler(RejectFriendRequest));
ProfileRouter.get('/get-list-friends', asyncHandler(GetListFriends));
export default ProfileRouter;