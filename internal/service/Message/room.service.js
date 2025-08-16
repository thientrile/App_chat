import { BadRequestError } from "../../../pkg/response/error.js";
import { convertToObjectIdMongoose, pairRoomId } from "../../../pkg/utils/index.utils.js";
import messageMode from "../../model/message.mode.js";
import roomModel from "../../model/room.model.js";
import {  findRoomById, getChatRooms } from "../../repository/room.reop.js";
import { userFindById } from "../../repository/user.repo.js";

export const getListRooms = async (userId) => {
  return await getChatRooms(userId);
}


export const createRoomPrivate = async (userId, usr_id) => {
  const findUserReciver = await userFindById(usr_id);
  const findUserSender = await checkUserExistByUserId(userId);

  if (!findUserReciver) throw new BadRequestError("Receiver not found");
  if (!findUserSender) throw new BadRequestError("Sender not found");
  const roomId = pairRoomId(findUserSender._id, findUserReciver._id);
  // Tạo hoặc lấy phòng chat
  const sortedIds = [userId, findUserReciver._id].sort((a, b) =>
    a.toString().localeCompare(b.toString())
  );

  let room = await roomModel.findOne({
    room_type: "private",
    "room_members.userId": { $all: sortedIds },
    room_members: { $size: 2 },
  });
  if (!room) {
    room = await roomModel.create({
      room_id: roomId,
      room_type: "private",
      room_members: sortedIds.map((id) => ({
        userId: id,
        role: "member",
      })),
    });
  }
  return {
    id: roomId,
  }
}


export const getRoomMessages = async (userId, roomId, limit = 50, cursor = null) => {
 
  // check room is exist
  const findRoom = await findRoomById(roomId)
  // console.log("🚀 ~ getRoomMessages ~ findRoom:", findRoom)
  if (!findRoom) {
    throw new BadRequestError("Room not found");
  }

        
  const getRoom= await roomModel.findById(findRoom._id)
  // check user is member of room
  const isMember = getRoom.room_members.some(member => member.userId.equals(userId));
  if (!isMember) {
    throw new BadRequestError("User is not a member of the room");
  }

  //build match
  const match = { msg_room: getRoom._id, msg_deleted: { $ne: true } };
  if (cursor) {
    if (!Types.ObjectId.isValid(cursor)) throw new Error("CURSOR_INVALID");
    match._id = { $lt: convertToObjectIdMongoose(cursor) }; // lấy về trước cursor (mới → cũ)
  }
  const realLimit = Math.min(Number(limit) || 50, 100);
  const pipeline = [
    { $match: match },
    { $sort: { _id: -1 } },
    { $limit: realLimit + 1 }, // lấy thừa 1 để tính nextCursor

    // Join sender
    {
      $lookup: {
        from: "Users",                    // CHÚ Ý: đúng tên collection bạn set ở schema
        localField: "msg_sender",
        foreignField: "_id",
        as: "sender",
        pipeline: [
          { $project: { _id: 1, usr_fullname: 1, usr_avatar: 1, usr_slug: 1, usr_status: 1 } }
        ]
      }
    },
    { $addFields: { sender: { $first: "$sender" } } },

    // Đếm người đã đọc (readed)
    {
      $lookup: {
        from: "MessageEvents",
        let: { mid: "$_id" },
        as: "reads",
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$event_msgId", "$$mid"] },
                  { $eq: ["$event_type", "readed"] },
                ]
              }
            }
          },
          { $group: { _id: "$event_msgId", readers: { $addToSet: "$event_senderId" }, readCount: { $sum: 1 } } }
        ]
      }
    },
    {
      $addFields: {
        readCount: { $ifNull: [{ $first: "$reads.readCount" }, 0] },
        readers: { $ifNull: [{ $first: "$reads.readers" }, []] }
      }
    },

    // Tôi đã đọc chưa?
    {
      $addFields: {
        isReadByMe: { $in: [userId, "$readers"] }
      }
    },

    // Project gọn
    {
      $project: {
        _id: 1,
        msg_content: 1,
        msg_type: 1,
        msg_room: 1,
        msg_sender: 1,
        createdAt: 1,
        updatedAt: 1,
        sender: 1,
        readCount: 1,
        isReadByMe: 1
      }
    }
  ];
  const docs = await messageMode.aggregate(pipeline);
  //  Xử lý nextCursor
  let nextCursor = null;
  if (docs.length > realLimit) {
    const popped = docs.pop();                 // phần tử thừa
    nextCursor = String(popped._id);
  }

  // Trả ngược theo thời gian tăng dần cho dễ render (tuỳ bạn)
  docs.reverse();

  return { items: docs, nextCursor };
}