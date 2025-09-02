import { SuccessReponse } from "../../../pkg/response/success.js";
import { omitInfoData } from "../../../pkg/utils/index.utils.js";
import { createRoomByType } from "../../service/Message/room.service.js";
import { acceptFriendRequest, rejectFriendRequest, sendFriendRequestToStranger, listPendingFriendRequests } from "../../service/profile/friendship.service.js";
import { findUserById, findUserByPhoneNumber, listFriends, updateProfileUser, listGroups } from "../../service/profile/profile.service.js";

export const SendFriendRequest = async (req, res) => {
    new SuccessReponse({
        message: "Send friend request successfully",
        metadata: await sendFriendRequestToStranger({
            ...req.body,
            user_send: req.decoded.userId
        })
    }).send(res);
}
export const FindUserByPhoneNumber = async (req, res) => {
    const {phone, type} = req.query;
    new SuccessReponse({
        message: "User found",
        metadata: await findUserByPhoneNumber(phone, req.decoded.userId, type)
    }).send(res);
}

export const FindUserById = async (req, res) => {
    const Id = req.params.id;
    new SuccessReponse({
        message: "User found",
        metadata: await findUserById(Id, req.decoded.userId)
    }).send(res);
}


export const AcceptFriendRequest = async (req, res) => {
    const Id = req.params.id;
    const metadata = await acceptFriendRequest(Id, req.decoded.userId);
    new SuccessReponse({
        message: "Friend request accepted successfully",
        metadata
    }).send(res);
}


export const RejectFriendRequest = async (req, res) => {
    const Id = req.params.id;
    const metadata = await rejectFriendRequest(Id, req.decoded.userId);
    new SuccessReponse({
        message: "Friend request rejected successfully",
        metadata
    }).send(res);
}


export const GetListFriends = async (req, res) => {
    new SuccessReponse({
        message: "List of friends",
        metadata: await listFriends(req.decoded.userId, req.query)
    }).send(res);
}


export const updateProfile = async (req, res) => {
    new SuccessReponse({
        message: "Update profile successfully",
        metadata: await updateProfileUser(req.decoded.userId, req.body)
    }).send(res);
}



export const getListGroups = async (req, res) => {
    new SuccessReponse({
        message: "List of groups",
        metadata: await listGroups(req.decoded.userId, req.query)
    }).send(res);
}

export const getListPendingFriendRequests = async (req, res) => {
    new SuccessReponse({
        message: "List of pending friend requests",
        metadata: await listPendingFriendRequests(req.decoded.userId, req.query)
    }).send(res);
}

export const createGroup = async (req, res) => {
    const body = req.body;
    const otherData = omitInfoData({
        fields: ["userIds"], 
        object: body
    });
    new SuccessReponse({
        message: "Group created successfully",
        metadata: await createRoomByType(req.decoded.userId, body.userIds, "group", otherData)
    }).send(res);
}