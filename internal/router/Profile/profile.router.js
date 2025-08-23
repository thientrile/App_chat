




import express from "express";
import { AcceptFriendRequest, createGroup, FindUserById, FindUserByPhoneNumber, GetListFriends, getListGroups, getListPendingFriendRequests, RejectFriendRequest, SendFriendRequest, updateProfile } from "../../controller/Profile/profile.controller.js";
import authertication from "../../../pkg/token/auth.js";
import validateSchema from '../../../pkg/validation/joi.js';
import { inputSendFriendRequest } from "../../validation/Profile.js";
import { asyncHandler } from "../../../pkg/async/asyncHandler.js";
const ProfileRouter = express.Router();
ProfileRouter.use(authertication);
ProfileRouter.post('/send-friend-request',validateSchema(inputSendFriendRequest), asyncHandler(SendFriendRequest));
ProfileRouter.get('/find-user-by-phone', asyncHandler(FindUserByPhoneNumber));
ProfileRouter.get('/find-user-by-id/:id', asyncHandler(FindUserById));
ProfileRouter.post('/accept-friend-request/:id', asyncHandler(AcceptFriendRequest));
ProfileRouter.post('/reject-friend-request/:id', asyncHandler(RejectFriendRequest));
ProfileRouter.get('/get-list-friends', asyncHandler(GetListFriends));
ProfileRouter.patch('/update', asyncHandler(updateProfile));
ProfileRouter.get('/get-list-pending-friend-requests', asyncHandler(getListPendingFriendRequests));
ProfileRouter.get('/get-list-groups', asyncHandler(getListGroups));
ProfileRouter.post('/create-group', asyncHandler(createGroup));

export default ProfileRouter;