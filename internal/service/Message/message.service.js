import { BadRequestError } from "../../../pkg/response/error.js";
import { convertToObjectIdMongoose } from "../../../pkg/utils/index.utils.js";
import messageMode from "../../model/message.mode.js";
import roomModel from "../../model/room.model.js";
import { findRoomById } from "../../repository/room.reop.js";


export const sendMessageToRoom = async (userId, payload) => {
    const { roomId, content, type } = payload
    console.log(userId);
    console.log(payload);
    //find roomId
    const room = await findRoomById(roomId)
    if (!room) {
        throw new BadRequestError("Room not found");
    }
    const data = {
        msg_room: room._id,
        msg_content: content,
        msg_type: type,
        msg_sender: convertToObjectIdMongoose(userId)
    }
    const newMsg = (await messageMode.create(data))
    console.log("🚀 ~ sendMessageToRoom ~ newMsg:", newMsg)
    if (!newMsg) {
        throw new BadRequestError("Message not created");
    }
    room.room_last_messages = newMsg._id;
    await roomModel.findOneAndUpdate(
        { _id: room._id },
        { $set: { room_last_messages: newMsg._id } },
        { new: true }
    );
    return newMsg;
}