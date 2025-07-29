import { SuccessReponse } from "../../../pkg/response/success.js";
import { sendFriendRequestToStranger } from "../../service/profile/friendship.service.js";
import { findUserById, findUserByPhoneNumber } from "../../service/profile/profile.service.js";

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
    const  phoneNumber = req.params.phone;
    new SuccessReponse({
        message: "User found",
        metadata: await findUserByPhoneNumber(phoneNumber, req.decoded.userId)
    }).send(res);
}

export const FindUserById = async (req, res) => {
    const Id = req.params.id;
    new SuccessReponse({
        message: "User found",
        metadata: await findUserById(Id,req.decoded.userId)
    }).send(res);
}