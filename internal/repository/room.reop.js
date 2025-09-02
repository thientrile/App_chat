import { convertToObjectIdMongoose, escape } from '../../pkg/utils/index.utils.js';
import roomModel from '../model/room.model.js';


export const getChatRooms = async (userId, room_type = 'private', options = {}) => {
  const objectId = convertToObjectIdMongoose(userId);
  const { offset, limit } = options;
  const rooms = await roomModel.aggregate([
    // 1) Các phòng mà user đang là member
    { $match: { "room_members.userId": objectId, room_type: room_type } },

    // 2) Union thêm các phòng user từng gửi tin nhắn
    {
      $unionWith: {
        coll: "Rooms", // đúng tên collection bạn set trong schema
        pipeline: [
          { $match: { room_type: room_type } },
          {
            $lookup: {
              from: "Messages",
              let: { uid: objectId },
              pipeline: [
                { $match: { $expr: { $eq: ["$msg_sender", "$$uid"] } } }
              ],
              as: "sent_msgs"
            }
          },
          { $match: { "sent_msgs.0": { $exists: true } } }
        ]
      }
    },

    // 3) Loại trùng
    { $group: { _id: "$_id", doc: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$doc" } },

    // 4) Join last_message
    {
      $lookup: {
        from: "Messages",
        localField: "room_last_messages",
        foreignField: "_id",
        as: "last_message"
      }
    },
    { $unwind: { path: "$last_message", preserveNullAndEmptyArrays: true } },

    // 2) Với mỗi room, lookup members (để hiển thị tên/ảnh)
    {
      $lookup: {
        from: "Users",
        localField: "room_members.userId",
        foreignField: "_id",
        pipeline: [{ $project: { _id: 1, usr_id: 1, usr_fullname: 1, usr_avatar: 1 } }],
        as: "members"
      }
    },

    // 3) Với mỗi room, kiểm tra user đã từng gửi message trong CHÍNH room này
    {
      $lookup: {
        from: "Messages",
        let: { rid: "$_id", uid: objectId },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$msg_roomId", "$$rid"] },   // RÀNG BUỘC THEO ROOM HIỆN TẠI
                  { $eq: ["$msg_sender", "$$uid"] }
                ]
              }
            }
          },
          { $limit: 1 } // chỉ cần biết có tồn tại là đủ
        ],
        as: "sent_by_me"
      }
    },

    // 4) Giữ lại room nếu user là member HOẶC đã từng gửi tin trong room đó
    {
      $match: {
        $or: [
          { "room_members.userId": objectId },
          { "sent_by_me.0": { $exists: true } }
        ]
      }
    },

    // 5) Tính field hiển thị
    {
      $addFields: {
        otherMember: {
          $first: {
            $filter: {
              input: "$members",
              as: "m",
              cond: { $ne: ["$$m._id", objectId] }
            }
          }
        },
        groupAvatars: { $slice: ["$members.usr_avatar", 4] },
        member_count: {
          $cond: [
            { $eq: ["$room_type", "group"] },
            { $size: "$members" },
            "$$REMOVE"
          ]
        }
      }
    },

    // 6) Check read-status của last_message
    {
      $lookup: {
        from: "MessageEvents",
        let: { lastMsgId: "$room_last_messages", me: objectId },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$event_msgId", "$$lastMsgId"] },
                  { $eq: ["$event_userId", "$$me"] },
                  { $eq: ["$event_type", "readed"] }
                ]
              }
            }
          }
        ],
        as: "read_status"
      }
    },
    { $addFields: { is_read: { $gt: [{ $size: "$read_status" }, 0] } } },

    // 7) Sort theo thời gian last_message
    { $sort: { "last_message.createdAt": -1 } },

    // 8) Project kết quả (id hiển thị tuỳ loại phòng)
    {
      $project: {
        _id: 0,
        id: {
          $cond: [
            { $eq: ["$room_type", "private"] },
            "$otherMember.usr_id",
            "$room_id"
          ]
        },
        type: "$room_type",
        last_message: {
          msg_content: "$last_message.msg_content",
          createdAt: "$last_message.createdAt",
          msg_id: "$last_message.msg_id"
        },
        name: {
          $cond: [
            { $eq: ["$room_type", "private"] },
            "$otherMember.usr_fullname",
            "$room_name"
          ]
        },
        avatar: {
          $cond: [
            { $eq: ["$room_type", "private"] },
            "$otherMember.usr_avatar",
            "$groupAvatars"
          ]

        },
        is_read: 1,
        member_count: {
          $cond: [
            { $eq: ["$room_type", "group"] },
            "$member_count",
            "$$REMOVE"
          ]
        },
        room_avatar: "$room_avatar",
      }
    },
    { $skip: Number(offset || 0) },
    { $limit: Number(limit || 1000) }
  ]);

  return rooms;
};




async function findRoomByHalf(half) {
  const h = escape(half);
  // Thử nửa đứng TRƯỚC: ^half\.  (có cơ hội dùng index room_id:1)
  let doc = await roomModel.findOne(
    { room_type: "private", room_id: new RegExp(`^${h}\\.`) },
    { _id: 1, room_id: 1, room_type: 1, room_members: 1 }
  ).lean();
  if (doc) return doc;

  // Fallback nửa đứng SAU: \.half$  (khó dùng index nhưng cần có)
  doc = await roomModel.findOne(
    { room_type: "private", room_id: new RegExp(`\\.${h}$`) },
    { _id: 1, room_id: 1, room_type: 1, room_members: 1 }
  ).lean();

  return doc; // null nếu không có
}
export async function findRoomById(roomIdOrHalf) {
  const s = String(roomIdOrHalf).trim();

  // Nếu là group (không có dấu chấm) → so thẳng
  if (!s.includes(".")) {
    // thử group id trước
    const byGroup = await roomModel.findOne(
      { room_type: "group", room_id: s },
      { _id: 1, room_id: 1, room_type: 1, room_members: 1 }
    ).lean();
    if (byGroup) return byGroup;

    // nếu không phải group, coi như là "một nửa" private
    return findRoomByHalf(s);
  }

  // Nếu có dấu chấm → coi như full private id
  const doc = await roomModel.findOne(
    { room_type: "private", room_id: s },
    { _id: 1, room_id: 1, room_type: 1, room_members: 1 }
  ).lean();
  return doc;
}

// Function mới: Lấy thông tin chi tiết phòng với last message và trạng thái đọc
export const getRoomInfoById = async (roomId, userId) => {
  const objectId = convertToObjectIdMongoose(userId);

  const result = await roomModel.aggregate([
    // 1) Tìm phòng theo room_id
    { $match: { room_id: roomId } },

    // 2) Join với last_message
    {
      $lookup: {
        from: "Messages",
        localField: "room_last_messages",
        foreignField: "_id",
        as: "last_message"
      }
    },
    { $unwind: { path: "$last_message", preserveNullAndEmptyArrays: true } },

    // 3) Join với thông tin members
    {
      $lookup: {
        from: "Users",
        localField: "room_members.userId",
        foreignField: "_id",
        pipeline: [{ $project: { _id: 1, usr_id: 1, usr_fullname: 1, usr_avatar: 1 } }],
        as: "members"
      }
    },

    // 4) Tìm member khác (không phải current user) cho private chat
    {
      $addFields: {
        otherMember: {
          $first: {
            $filter: {
              input: "$members",
              as: "m",
              cond: { $ne: ["$$m._id", objectId] }
            }
          }
        }
      }
    },

    // 5) Kiểm tra trạng thái đã đọc của user hiện tại
    {
      $lookup: {
        from: "MessageEvents",
        let: { lastMsgId: "$room_last_messages", me: objectId },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$event_msgId", "$$lastMsgId"] },
                  { $eq: ["$event_senderId", "$$me"] },
                  { $eq: ["$event_type", "readed"] }
                ]
              }
            }
          }
        ],
        as: "read_status"
      }
    },

    // 6) Project kết quả theo format yêu cầu
    {
      $project: {
        _id: 0,
        id: {
          $cond: [
            { $eq: ["$room_type", "private"] },
            "$otherMember.usr_id",
            "$room_id"
          ]
        },
        type: "$room_type",
        name: {
          $cond: [
            { $eq: ["$room_type", "private"] },
            "$otherMember.usr_fullname",
            "$room_name"
          ]
        },
        avatar: {
          $cond: [
            { $eq: ["$room_type", "private"] },
            {
              $ifNull: [
                "$otherMember.usr_avatar",
                {
                  $concat: [
                    "https://ui-avatars.com/api/?name=",
                    { $replaceAll: { input: "$otherMember.usr_fullname", find: " ", replacement: "-" } },
                    "&background=random"
                  ]
                }
              ]
            },
            "$room_avatar"
          ]
        },
        last_message: {
          $cond: [
            { $ne: ["$last_message", null] },
            {
              msg_content: "$last_message.msg_content",
              createdAt: "$last_message.createdAt",
              msg_id: "$last_message.msg_id"
            },
            null
          ]
        },
        is_read: {
          $cond: [
            { $ne: ["$last_message", null] },
            { $gt: [{ $size: "$read_status" }, 0] },
            true
          ]
        }
      }
    }
  ]);

  return result.length > 0 ? result[0] : null;
};

export const listRoomIdByUserId = async (userId) => {
  const _id = convertToObjectIdMongoose(userId);

  const rooms = await roomModel.find({
    $or: [
      // User là member của room
      { "room_members.userId": _id },
      // User đã từng gửi tin nhắn trong room (từ Messages collection)
    ]
  }, {
    room_id: 1,
    _id: 0
  }).lean();



  return rooms;
};