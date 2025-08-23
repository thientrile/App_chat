import friendshipModel from "../../model/friendships.mode.js";
import { convertToObjectIdMongoose, omitInfoData, randomId, removePrefixFromKeys } from "../../../pkg/utils/index.utils.js";
import { checkUserExistByUserId, userFindById } from "../../repository/user.repo.js";
import { OmitUser } from "../../output/user.js";
import { KeyRedisGroup, KeyRedisFriend, KeyRedisRoom } from "../../../pkg/cache/cache.js";
import { BadRequestError } from "../../../pkg/response/error.js";
import { sendNotifyForUser } from "../notifycation/notify.service.js";
import { sAdd } from "../../../pkg/redis/utils.js";
import roomModel from "../../model/room.model.js";
import { createRoomByType } from "../Message/room.service.js";
export const sendFriendRequestToStranger = async (body) => {
  const { user_send, receiveId, message } = body;

  const senderId = convertToObjectIdMongoose(user_send);


  // Kiểm tra người nhận
  const receiver = await userFindById(receiveId);
  if (!receiver) {
    throw new BadRequestError("Người nhận không tồn tại");
  }
  const receiverId = convertToObjectIdMongoose(receiver._id);

  // Kiểm tra người gửi
  const sender = await checkUserExistByUserId(user_send);
  if (!sender) {
    throw new BadRequestError("Người gửi không tồn tại");
  }

  // Kiểm tra xem đã có mối quan hệ chưa
  const existingFriendship = await friendshipModel.findOne({
    $and: [
      {
        $or: [
          { frp_userId1: senderId, frp_userId2: receiverId },
          { frp_userId1: receiverId, frp_userId2: senderId },
        ],
      },
      { frp_status: { $in: ["accepted", "blocked"] } },
    ],
  });

  if (existingFriendship) {
    throw new BadRequestError("Đã tồn tại mối quan hệ giữa 2 người dùng này");
  }

  // Tạo dữ liệu thông báo
  const notifData = {
    notif_id: randomId(),
    notif_user_sender: senderId,
    notif_user_receive: receiverId,
    notif_type: "friend_request",
    notif_message: message,
    notif_status: "waiting",
  };

  // Dữ liệu push notification
  const cleanSender = removePrefixFromKeys(sender, "usr_");
  const messageSend = {
    title: "Lời mời Kết bạn",
    body: message,
    data: {
      screen: "InfoScreen",
      params: JSON.stringify({
        user: omitInfoData({ fields: OmitUser, object: cleanSender }),
        friendship: "pending",
      }),
    },
  };

  const friendshipData = {
    frp_userId1: senderId,
    frp_userId2: receiverId,
    frp_status: "pending",
  };

  // Gửi thông báo và tạo/cập nhật mối quan hệ
  const [notification] = await Promise.all([
    sendNotifyForUser(notifData, messageSend),
    friendshipModel.findOneAndUpdate(
      {
        $or: [
          { frp_userId1: senderId, frp_userId2: receiverId },
          { frp_userId1: receiverId, frp_userId2: senderId },
        ],
      },
      friendshipData,
      { upsert: true, new: true }
    ),
  ]);

  if (!notification) {
    throw new BadRequestError("Không thể gửi lời mời kết bạn");
  }

  return true;
};

export const acceptFriendRequest = async (Id, userId) => {
  // Tìm người gửi lời mời theo userId dạng số
  const sender = await userFindById(Id);
  if (!sender) {
    throw new BadRequestError("Không tìm thấy người gửi lời mời kết bạn");
  }

  const senderId = convertToObjectIdMongoose(sender._id);
  const receiverId = convertToObjectIdMongoose(userId);
  if (String(senderId) === String(receiverId)) {
    throw new BadRequestError("Không thể tự gửi hoặc chấp nhận lời mời kết bạn chính mình");
  }
  // Cập nhật trạng thái mối quan hệ
  const friendship = await friendshipModel.findOneAndUpdate(
    {
      $and: [
        {
          $or: [
            { frp_userId1: senderId, frp_userId2: receiverId },
            { frp_userId1: receiverId, frp_userId2: senderId },
          ],
        },
        { frp_status: "pending" },
      ],
    },
    {
      $set: { frp_status: "accepted" },
    },
    { new: true }
  );

  if (!friendship) {
    throw new BadRequestError("Lời mời không tồn tại hoặc đã được xử lý");
  }

  // Gửi thông báo đến người gửi
  const notifData = {
    notif_id: randomId(),
    notif_user_sender: senderId,
    notif_user_receive: receiverId,
    notif_type: "friend_request",
    notif_message: `${sender.usr_name} đã chấp nhận lời mời kết bạn của bạn`,
    notif_status: "accepted",
  };

  const cleanSender = removePrefixFromKeys(sender, "usr_");

  const messageSend = {
    title: "Lời mời Kết bạn",
    body: `${sender.usr_fullname} đã chấp nhận lời mời kết bạn của bạn`,
    data: {
      screen: "InfoScreen",
      params: JSON.stringify({
        user: omitInfoData({ fields: OmitUser, object: cleanSender }),
        friendship: "accepted",
      }),
    },
  };

  await sendNotifyForUser(notifData, messageSend);

  // Tạo hoặc lấy phòng chat


  const room = await createRoomByType(userId, [Id], "private");
  if (!room) {
    throw new BadRequestError("Không thể tạo phòng chat mới");
  }

  // Cập nhật Redis
  await Promise.all([
    sAdd(KeyRedisGroup(room.room_id), senderId, receiverId),
    sAdd(KeyRedisFriend(receiverId), senderId),
    sAdd(KeyRedisFriend(senderId), receiverId),
    sAdd(KeyRedisRoom(senderId), room.room_id),
    sAdd(KeyRedisRoom(receiverId), room.room_id),
  ]);

  return true;
};


export const rejectFriendRequest = async (Id, userId) => {
  // tìm kếm người gửi lời kết bạn
  const findreceive = await userFindById(Id);
  if (!findreceive) {
    throw new BadRequestError("User to accept friend request not found");
  }
  // nếu tìm thấy thì cập nhật trạng thái quan hệ
  const existingFriendship = await friendshipModel.findOneAndUpdate(
    { frp_userId1: convertToObjectIdMongoose(findreceive._id), frp_userId2: convertToObjectIdMongoose(userId), frp_status: "pending" }, {
    $set: { frp_status: "rejected" }
  },
    { new: true });
  if (!existingFriendship) {
    throw new BadRequestError("Friendship does not exist");
  }
  return true
}


export const listPendingFriendRequests = async (userId, options) => {
  const { limit, offset } = options;
  const pendingRequests = await friendshipModel.find({
    frp_userId2: convertToObjectIdMongoose(userId),
    frp_status: "pending"
  })
  .skip(offset)
  .limit(limit);

  return pendingRequests;
}


