import { convertToObjectIdMongoose, escape } from '../../pkg/utils/index.utils.js';
import roomModel from '../model/room.model.js';


export const getChatRooms = async (userId, room_type = 'private', options = {}) => {
  const objectId = convertToObjectIdMongoose(userId);
  const { offset, limit } = options;
  const rooms = await roomModel.aggregate([
    // 1) Các phòng mà user đang là member
    { $match: { "room_members.userId": objectId, room_type } },

    // 2) Union thêm các phòng user từng gửi tin nhắn
    {
      $unionWith: {
        coll: "Rooms", // đúng tên collection bạn set trong schema
        pipeline: [
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

    // 5) Join members
    {
      $lookup: {
        from: "Users",
        localField: "room_members.userId",
        foreignField: "_id",
        as: "members",
        pipeline: [
          { $project: { _id: 1, usr_id: 1, usr_fullname: 1, usr_avatar: 1 } }
        ]
      }
    },

    // 6) Tách "otherMember" cho private + gom avatar group
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
        groupAvatars: { $slice: ["$members.usr_avatar", 4] }
      }
    },

    // 7) Check read-status của last message (đặt TRƯỚC $project để còn field)
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
    { $addFields: { is_read: { $gt: [{ $size: "$read_status" }, 0] } } },

    // 8) Sort theo thời gian last_message
    { $sort: { "last_message.createdAt": -1 } },

    // 9) Project KẾT QUẢ — id: private -> usr_id của otherMember; group -> room_id
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
        is_read: 1
      }
    },
    { $skip: offset || 0 },
    { $limit: limit || 1000 }
  ]);

  return rooms;
};



async function findRoomByHalf(half) {
  const h = escape(half);
  // Thử nửa đứng TRƯỚC: ^half\.  (có cơ hội dùng index room_id:1)
  let doc = await roomModel.findOne(
    { room_type: "private", room_id: new RegExp(`^${h}\\.`) },
    { _id: 1, room_id: 1, room_type: 1 }
  ).lean();
  if (doc) return doc;

  // Fallback nửa đứng SAU: \.half$  (khó dùng index nhưng cần có)
  doc = await roomModel.findOne(
    { room_type: "private", room_id: new RegExp(`\\.${h}$`) },
    { _id: 1, room_id: 1, room_type: 1 }
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
      { _id: 1, room_id: 1, room_type: 1 }
    ).lean();
    if (byGroup) return byGroup;

    // nếu không phải group, coi như là "một nửa" private
    return findRoomByHalf(s);
  }

  // Nếu có dấu chấm → coi như full private id
  const doc = await roomModel.findOne(
    { room_type: "private", room_id: s },
    { _id: 1, room_id: 1, room_type: 1 }
  ).lean();
  return doc;
}