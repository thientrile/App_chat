import { convertToObjectIdMongoose } from "../../pkg/utils/index.utils.js";
import friendshipModel from "../model/friendships.mode.js";
export const checkrelationship = async (userId1, userId2) => {
  const friendship = await friendshipModel.findOne({
    $or: [
      { frp_userId1: convertToObjectIdMongoose(userId1), frp_userId2: convertToObjectIdMongoose(userId2) },
      { frp_userId1: convertToObjectIdMongoose(userId2), frp_userId2: convertToObjectIdMongoose(userId1) },
    ]
  })
  console.log("🚀 ~ checkrelationship ~ friendship:", friendship)
  if (!friendship) {
    return 'not_friends';
  }
  return friendship.frp_status;
}