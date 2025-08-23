import { SuccessReponse } from "../../../pkg/response/success.js"
import { SocketSuccessResponse } from "../../../pkg/socketio/socketSuccess.js"
import { findRoomById } from "../../repository/room.reop.js"
import { sendMessageToRoom } from "../../service/Message/message.service.js"
import { getListRooms, getRoomMessages } from "../../service/Message/room.service.js"


export const GetRoomChats = async (req, res) => {
    new SuccessReponse({
        message: "Get list rooms successfully",
        metadata: await getListRooms(req.decoded.userId)
    }).send(res)
}


export const GetRoomMessages = async (req, res) => {
    new SuccessReponse({
        message: "Get room messages successfully",
        metadata: await getRoomMessages(req.decoded.userId, req.params.roomId, req.query.limit, req.query.cursor)
    }).send(res)
}


export const SktSendMsg = async ({ socket, payload }) => {
    const room = await findRoomById(payload.roomId)
    console.log("🚀 ~ chatRoomHandler ~ room:", room.room_id)
    socket.join(room.room_id);
    SocketSuccessResponse.ok(
        {
            metadata: await sendMessageToRoom(socket.decoded.userId, payload),
        }
    ).to(socket, room.room_id,"room:message:received").emit(socket, "room:sended:message");
} 