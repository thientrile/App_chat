import { SuccessReponse } from "../../../pkg/response/success.js"
import { SocketSuccessResponse } from "../../../pkg/socketio/socketSuccess.js"
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
    SocketSuccessResponse.ok(
        {
            metadata: await sendMessageToRoom(socket.decoded.userId, payload),
        }
    ).emit(socket,"room:message:received", { userId: socket.decoded.userId, payload });
} 