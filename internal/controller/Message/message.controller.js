import { SuccessReponse } from "../../../pkg/response/success.js"
import { SocketSuccessResponse } from "../../../pkg/socketio/socketSuccess.js"
import { findRoomById } from "../../repository/room.reop.js"
import { readMarkMsgToRoom, sendMessageToRoom } from "../../service/Message/message.service.js"
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
    socket.join(room.room_id);
    SocketSuccessResponse.ok(
        {
            metadata: await sendMessageToRoom(socket.decoded.userId, payload),
        }
    ).to(socket, room.room_id, "room:message:received").emit(socket, "room:sended:message");
}


export const SktReadedMsg = async ({ socket, payload }) => {
    const room = await findRoomById(payload.roomId)
    console.log("🚀 ~ chat read marked ~ room:", room.room_id)
    SocketSuccessResponse.ok(
        {
            metadata: await readMarkMsgToRoom(socket.decoded.userId, payload),
        }
    ).to(socket, room.room_id, "room:readed:message")
}

export const SktIncomingCall = async ({ socket, payload }) => {
    const room = await findRoomById(payload.roomId);
    socket.join(room.room_id);
    SocketSuccessResponse.ok({
        message: "Incoming call",
        metadata: payload
    }).to(socket, room.room_id, "call:incoming");
}

export const SktAcceptCall = async ({ socket, payload }) => {
    const room = await findRoomById(payload.roomId);
    SocketSuccessResponse.ok({
        message: "Call accepted",
        metadata: payload
    }).to(socket, room.room_id, "call:accepted");
}

export const SktRejectCall = async ({ socket, payload }) => {
    const room = await findRoomById(payload.roomId);
    console.log("🚀reject call", payload);
    SocketSuccessResponse.ok({
        message: "Call rejected",
        metadata: payload
    }).to(socket, room.room_id, "call:rejected");
}

export const SktWebRTC = async ({ socket, payload }) => {
    const room = await findRoomById(payload.roomId);
    const { to, from, offer, answer, candidate, roomId } = payload;
    SocketSuccessResponse.ok({
        message: "WebRTC signal",
        metadata: {
            from,
            to,
            offer,
            answer,
            candidate,
            roomId
        }
    }).to(socket, room.room_id, "client:signal");
}