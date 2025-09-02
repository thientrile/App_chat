import { convertToObjectIdMongoose, omitInfoData, removePrefixFromKeys } from "../../pkg/utils/index.utils.js";
import friendshipModel from "../model/friendships.mode.js";
import { OmitUser } from "../output/user.js";
export const checkrelationship = async (userId1, userId2) => {
  const friendship = await friendshipModel.findOne({
    $or: [
      { frp_userId1: convertToObjectIdMongoose(userId1), frp_userId2: convertToObjectIdMongoose(userId2) },
      { frp_userId1: convertToObjectIdMongoose(userId2), frp_userId2: convertToObjectIdMongoose(userId1) },
    ]
  })
  if (!friendship) {
    return 'not_friends';
  }
  return friendship.frp_status;
}

const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Lấy danh sách bạn bè (ID) của user, có thể lọc theo tên/điện thoại.
 * @param {string|ObjectId} userId - _id của User (ObjectId)
 * @param {{ q?: string, limit?: number }} options
 * @returns {Promise<string[]>} friendIds (ObjectId dưới dạng string)
 */
export const getFriendIdsOfUser = async (userId, options = {}) => {
  const { q, limit = 1000, offset = 0 } = options;
  const objectId = convertToObjectIdMongoose(userId);

  // Tạo bộ lọc tìm theo tên/điện thoại nếu có q
  let nameOrPhoneMatch = null;
  if (q && q.trim()) {
    const re = new RegExp(escapeRegExp(q.trim()), "i");
    nameOrPhoneMatch = {
      $or: [
        { "friend.usr_fullname": re },
        { "friend.usr_phone": re }
      ]
    };
  }

  const pipeline = [
    // Chỉ lấy friendship đã accept và có user tham gia
    {
      $match: {
        frp_status: "accepted",
        $or: [{ frp_userId1: objectId }, { frp_userId2: objectId }]
      }
    },
    // Xác định friendId = người còn lại
    {
      $addFields: {
        friendId: {
          $cond: [{ $eq: ["$frp_userId1", objectId] }, "$frp_userId2", "$frp_userId1"]
        }
      }
    },
    // Join thông tin bạn bè để search theo tên/điện thoại
    {
      $lookup: {
        from: "Users",                // đúng tên collection của bạn
        localField: "friendId",
        foreignField: "_id",
        as: "friend",
        pipeline: [
          { $project: { _id: 1, usr_fullname: 1, usr_phone: 1 } }
        ]
      }
    },
    { $unwind: "$friend" },
  ];

  if (nameOrPhoneMatch) pipeline.push({ $match: nameOrPhoneMatch });

  pipeline.push(
    { $limit: Math.max(1, Math.min(+limit || 1000, 5000)) },
    { $skip: Number(offset) || 0 },
    { $project: { _id: 0, friendId: 1 } }
  );

  const rows = await friendshipModel.aggregate(pipeline);
  return rows.map(r => String(r.friendId));
};