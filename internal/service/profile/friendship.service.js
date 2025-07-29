import notificationModel from "../../model/notification.model.js";
import friendshipModel from "../../model/friendships.mode.js";
import { getAllFcmToken } from "../../repository/key.repo.js";
import { pushMessage } from "../../../pkg/firebase/index.js";
import { convertToObjectIdMongoose, omitInfoData, randomId, removePrefixFromKeys } from "../../../pkg/utils/index.utils.js";
import { checkUserExistByUserId, userFindById } from "../../repository/user.repo.js";
import { checkrelationship } from "../../repository/friendship.repo.js";
import { OmitUser } from "../../output/user.js";
import { KeyRedisGroup } from "../../../pkg/cache/cache.js";
import { BadRequestError } from "../../../pkg/response/error.js";
export const sendFriendRequestToStranger = async (body) => {
  const { user_send, receiveId, message } = body;
  const findreceive = await userFindById(receiveId);

  if (!findreceive) {
    throw new BadRequestError("User to receive friend request not found");
  }
  const notifData = {
    notif_id: randomId(),
    notif_user_sender: convertToObjectIdMongoose(user_send),
    notif_user_receive: convertToObjectIdMongoose(findreceive._id),
    notif_type: "friend_request",
    notif_message: message,
    notif_status: "waiting"
  };
  // get id of sender 
  const userSender = await checkUserExistByUserId(user_send);
  if (!userSender) {
    throw new BadRequestError("User sending friend request does not exist");
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
    throw new BadRequestError("Friendship already exists between these users");
  }
  const frpData = {
    frp_userId1: convertToObjectIdMongoose(user_send),
    frp_userId2: convertToObjectIdMongoose(findreceive._id),
    frp_status: "pending"
  };
  const [notification] = await Promise.all([
     sendNotifyForUser(notifData, messageSend),
    friendshipModel.findOneAndUpdate({
      $or: [
        { frp_userId1: convertToObjectIdMongoose(user_send), frp_userId2: convertToObjectIdMongoose(findreceive._id) },
        { frp_userId1: convertToObjectIdMongoose(findreceive._id), frp_userId2: convertToObjectIdMongoose(user_send) }
      ]
    }, frpData, { upsert: true, new: true }),
  ])
  if (!notification) {
    throw new BadRequestError("Unable to send friend request");
  }
  return true;
}

export const acceptFriendRequest = async (Id, userId) => {
  // tìm kếm người gửi lời kết bạn
  const findreceive = await userFindById(Id);
  if (!findreceive) {
    throw new BadRequestError("User to accept friend request not found");
  }
  // nếu tìm thấy thì cập nhật trạng thái quan hệ
  const existingFriendship = await friendshipModel.findOneAndUpdate(
    { frp_userId1: convertToObjectIdMongoose(findreceive._id), frp_userId2: convertToObjectIdMongoose(userId),frp_status: "pending" }, {
    $set: { frp_status: "accepted" }
  },
    { new: true });
  if (!existingFriendship) {
    throw new BadRequestError("Friend request does not exist or has already been accepted");
  }
  //  xử lý thông báo
  const notifyData={
    notif_id: randomId(),
    notif_user_sender: convertToObjectIdMongoose(findreceive._id),
    notif_user_receive: convertToObjectIdMongoose(userId),
    notif_type: "friend_request",
    notif_message: `${findreceive.usr_name} đã chấp nhận lời mời kết bạn của bạn`,
    notif_status: "accepted"
  }
  const messageSend = {
    title: "Lời mời Kết bạn",
    body: `${findreceive.usr_name} đã chấp nhận lời mời kết bạn của bạn`,
    data: {
      screen: "InfoScreen",
      params: JSON.stringify({
        user: omitInfoData({ fields: OmitUser, object: findreceive }),
        friendship: "accepted"
      }),
    },
  };
  await sendNotifyForUser(notifyData, messageSend);
  // tạo room chat private
  const objectId1 = convertToObjectIdMongoose(userId);
  const objectId2 = convertToObjectIdMongoose(findreceive._id);

  // Sắp xếp để đảm bảo thứ tự cố định
  const sortedIds = [objectId1, objectId2].sort((a, b) =>
    a.toString().localeCompare(b.toString())
  );
  const query = {
    room_type: 'private',
    'room_members.userId': { $all: sortedIds },
    $expr: { $eq: [{ $size: "$room_members" }, 2] }
  };
  const update = {
    room_id: randomId(),
    room_type: "private",
    room_members: [
      {
        userId: convertToObjectIdMongoose(findreceive._id),
        role: "member"
      },
      {
        userId: convertToObjectIdMongoose(userId),
        role: "member"
      }
    ],
  }
  const options = { new: true, upsert: true };
  const room = await roomModel.findOneAndUpdate(query, update, options);
  if (!room) {
    throw new BadRequestError("Unable to create chat room");
  }
  const arrAddUser= sortedIds.map(async userId=>sAdd(KeyRedisGroup(room.room_id), userId));
  arrAddUser.push(sAdd(KeyRedisFriend(userId), findreceive._id));
  arrAddUser.push(sAdd(KeyRedisFriend(findreceive._id), userId));
  await Promise.all(arrAddUser);

  return true;
}

export const rejectFriendRequest = async (Id, userId) => {
  // tìm kếm người gửi lời kết bạn
  const findreceive = await userFindById(Id);
  if (!findreceive) {
    throw new BadRequestError("User to accept friend request not found");
  }
  // nếu tìm thấy thì cập nhật trạng thái quan hệ
  const existingFriendship = await friendshipModel.findOneAndUpdate(
    { frp_userId1: convertToObjectIdMongoose(findreceive._id), frp_userId2: convertToObjectIdMongoose(userId),frp_status: "pending" }, {
    $set: { frp_status: "rejected" }
  },
    { new: true });
  if (!existingFriendship) {
    throw new BadRequestError("Friendship does not exist");
  }
  return true
}




