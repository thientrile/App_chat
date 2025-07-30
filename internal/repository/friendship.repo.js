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

export const getFriendIdsOfUser = async (userId) => {
  const objectId = convertToObjectIdMongoose(userId);

  const friendships = await friendshipModel.find({
    frp_status: 'accepted',
    $or: [
      { frp_userId1: objectId },
      { frp_userId2: objectId }
    ]
  });

  // Trả về danh sách ObjectId (kiểu string) của bạn bè
  const friendIds = friendships.map(f => {
    return f.frp_userId1.equals(objectId)
      ? f.frp_userId2.toString()
      : f.frp_userId1.toString();
  });
  

  return friendIds;
};