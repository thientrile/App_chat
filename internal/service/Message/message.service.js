import { BadRequestError } from "../../../pkg/response/error.js";
import { convertToObjectIdMongoose, omitInfoData, randomId, removePrefixFromKeys } from "../../../pkg/utils/index.utils.js";
import messageMode from "../../model/message.mode.js";
import message_eventModel from "../../model/message_event.model.js";
import roomModel from "../../model/room.model.js";
import userModel from "../../model/user.model.js";
import { findRoomById, getRoomInfoById } from "../../repository/room.reop.js";
import { outputMessage } from "../../validation/Message.js";
import { sendNotify, sendNotifyForUser } from "../notifycation/notify.service.js";


export const sendMessageToRoom = async (userId, payload) => {
    const { roomId, content, id } = payload

    //find roomId
    // const room = await findRoomById(roomId)

    // const sender = await userModel.findById(userId).select("usr_fullname usr_avatar usr_slug status usr_id -_id").lean();

    const [room, sender] = await Promise.all([
        findRoomById(roomId),
        userModel.findById(userId).select("usr_fullname usr_avatar usr_slug status usr_id -_id").lean()
    ])
    if (!room) {
        throw new BadRequestError("Room not found");
    }
    const from = room.room_type === "private" ? sender.usr_fullname : room.room_name;
    const members = room.room_members.map(m => m.userId.toString())
    const roomInfo = await getRoomInfoById(room.room_id, userId)
    // createe notifle data
    const messageSend = {
        title: `~${from} Tin nhắn mới`,
        body: content,
        data: {
            screen: "ChatRoom",
            // subScreen: "Chats",
            params: JSON.stringify(roomInfo),
        },
    };

    const data = {
        msg_id: id || randomId(),
        msg_room: room._id,
        msg_content: content,
        // msg_type: type,
        msg_sender: convertToObjectIdMongoose(userId)
    }
    const newMsg = (await messageMode.create(data))
    const removePrefix = removePrefixFromKeys(newMsg.toObject(), "msg_")
    if (!newMsg) {
        throw new BadRequestError("Message not created");
    }
    //send notification
    const recipients = members.filter((m) => m !== String(userId));

    // 1) chuẩn bị promises (KHÔNG await ở đây)
    const notifyPromises = recipients.map((uid) => sendNotify(uid, messageSend));
    const dbPromise = [
        message_eventModel.findOneAndUpdate(
            { event_roomId: room._id, event_userId: convertToObjectIdMongoose(userId), event_type: 'readed' },
            { event_msgId: newMsg._id },
            { new: true, upsert: true }
        ),
        roomModel.findOneAndUpdate(
            { _id: room._id },
            { $set: { room_last_messages: newMsg._id } },
            { new: true }
        )
    ]
    await Promise.all(
        [
            Promise.allSettled(notifyPromises),
            Promise.all(dbPromise)
        ]
    );

    const message = omitInfoData({ fields: outputMessage, object: removePrefix });
    message.readCount = 0;
    message.isReadByMe = false;
    message.sender = removePrefixFromKeys(sender, "usr_");
    const rmId = room.room_id.includes(".") ? room.room_id.replace(".", "").replace(roomId, "") : roomId;
    return {
        roomId: rmId,
        message
    };
}



// msg event



export const readMarkMsgToRoom = async (userId, payload) => {
    const { roomId, lastMsgId } = payload;

    // Find the room
    const room = await findRoomById(roomId);
    if (!room) {
        throw new BadRequestError("Room not found");
    }
    const isMember = await roomModel.exists({ _id: room._id, "room_members.userId": convertToObjectIdMongoose(userId) });
    if (!isMember) {
        throw new BadRequestError("User is not a member of the room");
    }
    // check message
    const message = await messageMode.findOne({ msg_id: lastMsgId, msg_room: room._id });
    if (!message) {
        throw new BadRequestError("Message not found");
    }
    await message_eventModel.findOneAndUpdate(
        { event_roomId: room._id, event_userId: convertToObjectIdMongoose(userId), event_type: 'readed' },
        { event_msgId: message._id },
        { new: true, upsert: true }
    );
    // // Mark the message as read
    // await messageMode.updateOne(
    //     { _id: messageId, msg_room: roomId },
    //     { $addToSet: { msg_read_by: userId } }
    // );
    // console.log("🚀 ~ readMarkMsgToRoom ~ roomId:", room.room_id.replace(".", "").replace(roomId, ""));
    const rmId = room.room_id.includes(".") ? room.room_id.replace(".", "").replace(roomId, "") : roomId
    return {
        roomId: rmId,
        lastMsgId
    };
}



