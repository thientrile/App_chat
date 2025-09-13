import { Types } from "mongoose";
import { BadRequestError } from "../../../pkg/response/error.js";
import { convertToObjectIdMongoose, omitInfoData, pairRoomId } from "../../../pkg/utils/index.utils.js";
import messageModel from "../../model/message.mode.js";
import roomModel from "../../model/room.model.js";
import { findRoomById, getChatRooms, getChatRoomsAll, listRoomIdByUserId } from "../../repository/room.reop.js";
import { checkUserExistByUserId, userFindById } from "../../repository/user.repo.js";
import { KeyOnlineSocket, KeyRedisRoom } from "../../../pkg/cache/cache.js";
import { getArray, sAdd, sCard, sMembers } from "../../../pkg/redis/utils.js";


export const canViewRoomForUser = async (userId, roomId) => {
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
  return await getChatRoomsAll(userId);
}

export const getListRoomsGroup = async (userId, options) => {
  return await getChatRooms(userId, 'group', options);
}


export const createRoomByType = async (userId, usr_ids, room_type = 'private', request = {}) => {
  let sortedIds = [];
  const data = {
    room_id: null,
    room_type,
    room_members: [],
    room_name: request.name || "Default Room",
    room_avatar: request.avatar || "https://picsum.photos/800/400",
  };
  if (room_type == 'private') {
    const findUserReciver = await userFindById(usr_ids[0]);
    const findUserSender = await checkUserExistByUserId(userId);
    if (!findUserReciver) throw new BadRequestError("Receiver not found");
    if (!findUserSender) throw new BadRequestError("Sender not found");
    data.room_id = pairRoomId(findUserSender.usr_id, findUserReciver.usr_id);
    sortedIds = [findUserSender._id, findUserReciver._id].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );
    data.room_members = sortedIds.map((id) => ({
      userId: id,
      role: "member",
    }));
  } else {
    delete data.room_id; // cho tự gen
    const users = await Promise.all(usr_ids.map(id => userFindById(id)));
    sortedIds = [userId, ...users.map(user => user._id)].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );
    data.room_members = sortedIds.map(id => ({
      userId: id,
      role: "member",
    }));
  }

  if (room_type === "group") {
    const room = await roomModel.create(data);
    return { id: room.room_id };
  }
  let room = await roomModel.findOne({
    room_type: data.room_type,
    "room_members.userId": { $all: sortedIds.map(id => convertToObjectIdMongoose(id)) }, // Sửa tại đây
    room_members: { $size: 2 },
  });
  console.log("🚀 ~ createRoomByType ~ room:", room)
  const addRoomPromises = room.room_members.map(member => {
    const key = KeyRedisRoom(member.userId);
    return sAdd(key, room.room_id);
  });
  if (!room) {
    room = await roomModel.create(data);
  }
  await Promise.all(addRoomPromises);
  return {
    id: room.room_id,
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
  // const match = { msg_room: roomObjId, msg_deleted: { $ne: true } };
  const match = { msg_room: roomObjId, };
  if (cursorOid) match._id = { $lt: cursorOid };

  const realLimit = Math.min(Number(limit) || 50, 100);

  const pipeline = [
    { $match: match },
    { $sort: { _id: -1 } },
    { $limit: realLimit + 1 },

    // --- Join người gửi ---
    {
      $lookup: {
        from: "Users",
        localField: "msg_sender",
        foreignField: "_id",
        as: "sender",
        pipeline: [
          {
            $project: {
              _id: 0,
              fullname: "$usr_fullname",
              avatar: "$usr_avatar",
              slug: "$usr_slug",
              status: "$usr_status",
              id: "$usr_id",
            },
          },
        ],
      },
    },
    { $addFields: { sender: { $first: "$sender" } } },

    // --- Join message được reply (self-lookup) ---
    {
      $lookup: {
        from: "Messages",
        localField: "msg_replyTo",
        foreignField: "_id",
        as: "replyMsg",
        pipeline: [
          { $project: { _id: 1, msg_id: 1, msg_content: 1, msg_type: 1, msg_attachments: 1, msg_sender: 1 } },
          {
            $lookup: {
              from: "Users",
              localField: "msg_sender",
              foreignField: "_id",
              as: "replySender",
              pipeline: [
                { $project: { _id: 0, fullname: "$usr_fullname", avatar: "$usr_avatar", slug: "$usr_slug", id: "$usr_id" } },
              ],
            },
          },
          { $addFields: { replySender: { $first: "$replySender" } } },
          {
            $project: {
              _id: 0,
              replyTo: {
                id: "$msg_id",
                content: "$msg_content",
                type: "$msg_type",
                attachment: {
                  $cond: [
                    { $gt: [{ $size: "$msg_attachments" }, 0] },
                    {
                      kind: { $arrayElemAt: ["$msg_attachments.kind", 0] },
                      url: { $arrayElemAt: ["$msg_attachments.url", 0] },
                      thumbUrl: { $arrayElemAt: ["$msg_attachments.thumbUrl", 0] },
                      mimeType: { $arrayElemAt: ["$msg_attachments.mimeType", 0] },
                      width: { $arrayElemAt: ["$msg_attachments.width", 0] },
                      height: { $arrayElemAt: ["$msg_attachments.height", 0] },
                      duration: { $arrayElemAt: ["$msg_attachments.duration", 0] },
                    },
                    null,
                  ],
                },
                sender: "$replySender",
              },
            },
          },
        ],
      },
    },
    { $addFields: { replyTo: { $first: "$replyMsg.replyTo" } } },

    // --- Đếm người đã đọc ---
    {
      $lookup: {
        from: "MessageEvents",
        let: { mid: "$_id" },
        as: "reads",
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ["$event_msgId", "$$mid"] }, { $eq: ["$event_type", "readed"] }] } } },
          { $group: { _id: "$event_msgId", readers: { $addToSet: "$event_userId" }, readCount: { $sum: 1 } } },
        ],
      },
    },
    {
      $addFields: {
        readCount: { $ifNull: [{ $first: "$reads.readCount" }, 0] },
        readers: { $ifNull: [{ $first: "$reads.readers" }, []] },
      },
    },
    { $addFields: { isReadByMe: { $in: [uid, "$readers"] } } },

    // --- Tách riêng event del_all và del_only ---
    // Lấy del_all (nếu từng xảy ra, coi như global)
    {
      $lookup: {
        from: "MessageEvents",
        let: { mid: "$_id" },
        as: "delAllAgg",
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ["$event_msgId", "$$mid"] }, { $eq: ["$event_type", "del_all"] }] } } },
          { $limit: 1 }, // chỉ cần biết có hay không
          { $project: { _id: 0, hit: true } },
        ],
      },
    },
    { $addFields: { __delAll: { $gt: [{ $size: "$delAllAgg" }, 0] } } },

    // Lấy danh sách user đã "delete for me" (del_only)
    {
      $lookup: {
        from: "MessageEvents",
        let: { mid: "$_id" },
        as: "delOnlyAgg",
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ["$event_msgId", "$$mid"] }, { $eq: ["$event_type", "del_only"] }] } } },
          { $group: { _id: "$event_msgId", users: { $addToSet: "$event_userId" } } },
        ],
      },
    },
    { $addFields: { __delOnlyUsers: { $ifNull: [{ $first: "$delOnlyAgg.users" }, []] } } },

    // Xác định tôi có thuộc danh sách del_only không (tách riêng)
    { $addFields: { __delOnlyByMe: { $in: [uid, "$__delOnlyUsers"] } } },

    // isDeletedForMe = del_all (global) OR del_only_by_me (riêng tôi)
    { $addFields: { isDeletedForMe: { $or: ["$__delAll", "$__delOnlyByMe"] } } },

    // --- Project gọn ---
    {
      $project: {
        _id: 1,
        id: "$msg_id",

        // del_all -> ẩn cho tất cả; del_only -> ẩn chỉ khi là tôi
        content: {
          $cond: [
            { $or: ["$__delAll", "$__delOnlyByMe"] },
            "",
            "$msg_content",
          ],
        },

        // type có thể đổi thành "deleted" nếu tôi không được xem (để UI render placeholder)
        type: {
          $cond: [{ $eq: ["$isDeletedForMe", true] }, "deleted", "$msg_type"],
        },

        createdAt: 1,
        updatedAt: 1,
        sender: 1,

        readCount: 1,
        isReadByMe: 1,

        replyTo: "$replyTo",

        // Xuất 2 cờ độc lập
        del_all: "$__delAll",        // xóa toàn cục
        del_only: "$__delOnlyByMe",  // chỉ tôi đã xóa riêng
        isDeletedForMe: 1,
      },
    },
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




export const ensureUserRoomCache = async (userId) => {
  const key = KeyRedisRoom(userId);
  const count = await sCard(key);
  if (count > 0) return; // đã có cache

  const rooms = await listRoomIdByUserId(userId); // [{room_id}]
  if (rooms?.length) {
    const ids = rooms.map(r => String(r.room_id));
    // nạp hàng loạt cho nhanh
    await sAdd(key, ...ids);
  }
};