import { BadRequestError } from "../../../pkg/response/error.js";
import { convertToObjectIdMongoose, omitInfoData, removePrefixFromKeys } from "../../../pkg/utils/index.utils.js";
import messageMode from "../../model/message.mode.js";
import roomModel from "../../model/room.model.js";
import userModel from "../../model/user.model.js";
import { findRoomById } from "../../repository/room.reop.js";
import { outputMessage } from "../../validation/Message.js";
import { sendNotify, sendNotifyForUser } from "../notifycation/notify.service.js";


export const sendMessageToRoom = async (userId, payload) => {
    const { roomId, content, type } = payload

    //find roomId
    const room = await findRoomById(roomId)
    if (!room) {
        throw new BadRequestError("Room not found");
    }
    console.log("🚀 ~ sendMessageToRoom ~ room:", room.room_id)
    const sender = await userModel.findById(userId).select("usr_fullname usr_avatar usr_slug status usr_id -_id").lean();
    const from = room.room_type === "private" ? sender.usr_fullname : room.room_name;
    const members = room.room_members.map(m => m.userId.toString())

    const messageSend = {
        title: `~${from} Tin nhắn mới`,
        body: content,
        data: {
            screen: "Main",

            params: JSON.stringify({
                name: "Chats",
                id: roomId
            }),
        },
    };

    const data = {
        msg_room: room._id,
        msg_content: content,
        msg_type: type,
        msg_sender: convertToObjectIdMongoose(userId)
    }
    const newMsg = (await messageMode.create(data))
    const removePrefix = removePrefixFromKeys(newMsg.toObject(), "msg_")
    if (!newMsg) {
        throw new BadRequestError("Message not created");
    }
    //send notification
    const sendNoti = members.map(async (id) => {
        let notifyObje = {}
        notifyObje.notif_user_receive = id
        notifyObje.notif_type = "message"
        return await sendNotify(id, messageSend)
    })
    await Promise.all(sendNoti)
    room.room_last_messages = newMsg._id;
    await roomModel.findOneAndUpdate(
        { _id: room._id },
        { $set: { room_last_messages: newMsg._id } },
        { new: true }
    );
    const message = omitInfoData({ fields: outputMessage, object: removePrefix });
    message.readCount = 0;
    message.isReadByMe = false;
    message.sender = removePrefixFromKeys(sender, "usr_");
    return {
        roomId,
        message
    };
}



