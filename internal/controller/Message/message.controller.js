import { SuccessReponse } from "../../../pkg/response/success.js";
import { getListRooms, getMessagesByRoomIdService, sendMessageService, markMessagesAsRead } from "../../service/Messenge/room.service.js"


export const GetRoomChats = async (req, res) => {
    new SuccessReponse({
        message: "Get list rooms successfully",
        metadata: await getListRooms(req.decoded.userId)
    }).send(res)
}


export const GetMessagesByRoomId = async (req, res) => {
    const roomId = req.params.id;
    new SuccessReponse({
        message: "Get room by ID successfully",
        metadata: await getMessagesByRoomIdService(roomId)
    }).send(res);
};


export const SendMessage = async (req, res) => {
    new SuccessReponse({
        message: "Send message successfully",
        metadata: await sendMessageService(
            req.params.room_id,
            req.body.type,
            req.body.content,
            req.decoded.userId
        )
    }).send(res);
}

export const MaskAsRead = async (req, res) => {
    const roomId = req.params.room_id;
    new SuccessReponse({
        message: "Messages marked as read successfully",
        metadata: await markMessagesAsRead(roomId, req.decoded.userId)
    }).send(res);
}