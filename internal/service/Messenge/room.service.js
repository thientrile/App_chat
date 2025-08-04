import messageMode from "../../model/message.mode.js";
import message_eventModel from "../../model/message_event.model.js";
import { getChatRooms, getRoomById } from "../../repository/room.reop.js";

export const getListRooms = async (userId) => {
    return await getChatRooms(userId);
}

export const getMessagesByRoomIdService = async (roomId) => {
    return await getRoomById(roomId);
}

export const sendMessageService = async (roomId, type, content, userId) => {
    try {
        const { room} = await getRoomById(roomId);
        if (!room) {
            throw new Error("Room not found");
        }

        const message = await messageMode.create({
            msg_room: room._id,
            msg_sender: userId,
            msg_content: content,
            msg_type: type
        });

        // socket emit for new message
        if (global.IO) {
            global.IO.to(roomId).emit(`${roomId}:message`, {
                message: {
                    ...message._doc,
                    msg_sender: userId
                }
            });
        }

        return message;
    } catch (error) {
        console.error("Error sending message:", error);
        throw new Error(`Failed to send message: ${error.message}`);
    }
}


export const markMessagesAsRead = async (roomId, userId) => {
    const room = await getRoomById(roomId);
    if (!room) {
        throw new Error("Room not found");
    }

    await message_eventModel.create({
        event_type: 'readed',
        event_room: room._id,
        event_user: userId
    });

    if (global.IO) {
        global.IO.to(roomId).emit(`${roomId}:read`, {
            userId,
            roomId
        });
    }

    return { success: true };
}