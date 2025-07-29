import notificationModel from "../../model/notification.model.js";
import friendshipModel from "../../model/friendships.mode.js";
import { getAllFcmToken } from "../../repository/key.repo.js";
import { pushMessage } from "../../../pkg/firebase/index.js";
import { convertToObjectIdMongoose, omitInfoData, randomId, removePrefixFromKeys } from "../../../pkg/utils/index.utils.js";
import { checkUserExistByUserId, userFindById } from "../../repository/user.repo.js";
import { checkrelationship } from "../../repository/friendship.repo.js";
import { OmitUser } from "../../output/user.js";
export const sendFriendRequestToStranger = async (body) => {
  const { user_send, receiveId, message } = body;
  const findreceive = await userFindById(receiveId);

  if (!findreceive) {
    throw new Error("User to receive friend request not found");
  }
  const notif_id = randomId();
  const notifData = {
    notif_id,
    notif_user_sender: convertToObjectIdMongoose(user_send),
    notif_user_receive: convertToObjectIdMongoose(findreceive._id),
    notif_type: "friend_request",
    notif_message: message,
    notif_status: "waiting"
  };
  // get id of sender 
  const userSender = await checkUserExistByUserId(user_send);
  if (!userSender) {
    throw new Error("User sending friend request does not exist");
  }
  const user = removePrefixFromKeys(userSender, "usr_");
  const messageSend = {
    title: "Lời mời Kết bạn",
    body: message,
    data: {
      screen: "InfoScreen",
      // subScreen: 'ContactScreen',
      params: JSON.stringify({
        user: omitInfoData({ fields: OmitUser, object: user }),
        friendship: "pending"
      }),
    },
  };
  const existingFriendship = await friendshipModel.findOne({
    $and: [
      {
        $or: [
          { frp_userId1: convertToObjectIdMongoose(user_send), frp_userId2: convertToObjectIdMongoose(findreceive._id) },
          { frp_userId1: convertToObjectIdMongoose(findreceive._id), frp_userId2: convertToObjectIdMongoose(user_send) }
        ]
      },
      {
        frp_status: { $in: ["accepted", "pending", "blocked"] }
      }
    ]
  })
  if (existingFriendship) {
    throw new Error("Friendship already exists between these users");
  }
  const frpData = {
    frp_userId1: convertToObjectIdMongoose(user_send),
    frp_userId2: convertToObjectIdMongoose(findreceive._id),
    frp_status: "pending"
  };
  const fcmTokens = await getAllFcmToken(findreceive._id);
  const [notification] = await Promise.all([
    await notificationModel.create(notifData),
    await friendshipModel.findOneAndUpdate({
      $or: [
        { frp_userId1: convertToObjectIdMongoose(user_send), frp_userId2: convertToObjectIdMongoose(findreceive._id) },
        { frp_userId1: convertToObjectIdMongoose(findreceive._id), frp_userId2: convertToObjectIdMongoose(user_send) }
      ]
    }, frpData, { upsert: true, new: true }),
    await pushMessage(fcmTokens, messageSend)
  ])
  if (!notification) {
    throw new Error("Unable to send friend request");
  }
  return true;
}







