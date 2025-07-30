import { getChatRooms } from "../../repository/room.reop.js";

export const getListRooms = async (userId) => {
    return await getChatRooms(userId);
}