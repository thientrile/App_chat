import { Types } from "mongoose";
import { BadRequestError } from "../../../pkg/response/error.js";
import { convertToObjectIdMongoose, omitInfoData, pairRoomId } from "../../../pkg/utils/index.utils.js";
import messageModel from "../../model/message.mode.js";
import roomModel from "../../model/room.model.js";
import { findRoomById, getChatRooms } from "../../repository/room.reop.js";
import { userFindById } from "../../repository/user.repo.js";
import { KeyOnlineSocket } from "../../../pkg/cache/cache.js";
import { getArray, sCard, sMembers } from "../../../pkg/redis/utils.js";


const canViewRoomForUser = async (userId, roomId) => {
  const uid = convertToObjectIdMongoose(userId);

  // roomId là public id (room_id) => map sang _id
  const [found, listSocketIo] = await Promise.all([
    findRoomById(roomId),
    sMembers(KeyOnlineSocket(userId))
  ]);
  if (!found) return { ok: false }; // Room không tồn tại
  // console.log("🚀 ~ canViewRoomForUser ~ listSocketIo:", listSocketIo)
  listSocketIo.forEach(socketId => {

   global.IO.in(socketId).socketsJoin(found.room_id)
  });
  const rid = found._id;

  // (a) Còn là member?
  const isMemberNow = await roomModel.exists({ _id: rid, "room_members.userId": uid });

  // (b) Nếu không còn member → đã từng gửi tin trong room?
  let sentAny = false;
  if (!isMemberNow) {
    sentAny = await messageModel.exists({ msg_room: rid, msg_sender: uid });
  }

  return { ok: !!(isMemberNow || sentAny), roomObjectId: rid, isMemberNow: !!isMemberNow };
};



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
  const uid = convertToObjectIdMongoose(userId);

  // 1) Quyền xem: (a) member hiện tại hoặc (b) từng gửi tin trong room
  const gate = await canViewRoomForUser(userId, roomId);
  if (!gate.ok) throw new BadRequestError("Room not found or not allowed");
  const roomObjId = gate.roomObjectId;

  // 2) Resolve cursor: nhận `msg_id` (public). Nếu đưa `_id` cũng hỗ trợ.
  let cursorOid = null;
  if (cursor) {
    if (Types.ObjectId.isValid(cursor)) {
      cursorOid = convertToObjectIdMongoose(cursor);
    } else {
      const cur = await messageModel.findOne(
        { msg_room: roomObjId, msg_id: cursor },
        { _id: 1 }
      ).lean();
      if (!cur) throw new BadRequestError("CURSOR_NOT_FOUND");
      cursorOid = cur._id;
    }
  }

  // 3) Build match + pagination (keyset theo _id)
  const match = { msg_room: roomObjId, msg_deleted: { $ne: true } };
  if (cursorOid) match._id = { $lt: cursorOid };

  const realLimit = Math.min(Number(limit) || 50, 100);

  const pipeline = [
    { $match: match },
    { $sort: { _id: -1 } },
    { $limit: realLimit + 1 },

    // Join sender
    {
      $lookup: {
        from: "Users",
        localField: "msg_sender",
        foreignField: "_id",
        as: "sender",
        pipeline: [
          { $project: { _id: 0, usr_fullname: 1, usr_avatar: 1, usr_slug: 1, usr_status: 1, id: "$usr_id" } }
        ]
      }
    },
    { $addFields: { sender: { $first: "$sender" } } },

    // Đếm người đã đọc
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
                  { $eq: ["$event_type", "readed"] }
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
    { $addFields: { isReadByMe: { $in: [uid, "$readers"] } } },

    // Project gọn
    {
      $project: {
        _id: 1,
        id: "$msg_id",                 // public message id
        content: "$msg_content",
        type: "$msg_type",
        room: "$msg_room",
        // senderId: "$msg_sender",
        createdAt: 1,
        updatedAt: 1,
        sender: 1,
        readCount: 1,
        isReadByMe: 1
      }
    }
  ];

  let docs = await messageModel.aggregate(pipeline);

  // 4) nextCursor theo _id (ổn định)
  let nextCursor = null;
  if (docs.length > realLimit) {
    const popped = docs.pop();
    nextCursor = String(popped._id);
  }

  // 5) Đảo tăng dần cho UI + ẩn field nội bộ
  // docs.reverse();
  docs = docs.map(doc => omitInfoData({ fields: ["_id", "readers"], object: doc }));

  return { items: docs, nextCursor };
};