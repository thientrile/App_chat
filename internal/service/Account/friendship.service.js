import notificationModel from "../../model/notification.model.js";
import friendshipModel from "../../model/friendships.mode.js";
import { getAllFcmToken } from "../../repository/key.repo.js";
import { pushMessage } from "../../../pkg/firebase/index.js";
import { removePrefixFromKeys } from "../../../pkg/utils/index.utils.js";
const sendFriendRequestToStranger = async (body) => {
  const { user_send, user_receive, message } = body;
  const notifData = {
    notif_user_send: convertToObjectIdMongoose(user_send),
    notif_user_receive: convertToObjectIdMongoose(user_receive),
    notif_type: "friend_request",
    notif_message: message,
    notif_status: "waiting"
  };
  const frpData= {
    frp_userId1: convertToObjectIdMongoose(user_send),
    frp_userId2: convertToObjectIdMongoose(user_receive),
    frp_status: "pending"
  };
  const existingFriendship = await friendshipModel.findOne({
    status: "accepted",
    $or: [
      { frp_userId1: user_send, frp_userId2: user_receive },
      { frp_userId1: user_receive, frp_userId2: user_send },
    ],
  })
  if (existingFriendship) {
    throw new Error("Friendship already exists");
  }
  const fcmTokens = await getAllFcmToken(user_receive);
  const [notification] = await Promise.all([
    await notificationModel.create(notifData),
    await friendshipModel.create(frpData),
    await pushMessage(fcmTokens, message)
  ])
  if (!notification) {
    throw new Error("Unable to send friend request");
  }
  return { notification: removePrefixFromKeys(notification.toObject(), "notif_") };
}

const checkrelationship = async (userId1, userId2) => {
  const friendship = await friendshipModel.findOne({
    $or: [
      { frp_userId1: userId1, frp_userId2: userId2 },
      { frp_userId1: userId2, frp_userId2: userId1 },
    ],
  });
  if (!friendship) {
    return null;
  }
  return removePrefixFromKeys(friendship, "frp_");
}
export {
  sendFriendRequestToStranger,
  checkrelationship
}