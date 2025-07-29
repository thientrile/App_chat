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

  // Lấy danh sách userId còn lại
  const friendIds = friendships.map(f => {
    if (f.frp_userId1.equals(objectId)) {
      const data=removePrefixFromKeys(f.frp_userId2, "frp_");
      return omitInfoData({ fields: OmitUser, object: data });
    } else {
      const data=removePrefixFromKeys(f.frp_userId1, "frp_");
      return omitInfoData({ fields: OmitUser, object: data });
    }
  });

  return friendIds;
};