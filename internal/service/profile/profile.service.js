import { addPrefixToKeys, convertToObjectIdMongoose, omitInfoData, removePrefixFromKeys } from "../../../pkg/utils/index.utils.js";
import friendshipsMode from "../../model/friendships.mode.js";
import userModel from "../../model/user.model.js";
import { OmitUser } from "../../output/user.js";
import { checkrelationship, getFriendIdsOfUser } from "../../repository/friendship.repo.js";
import { userFindById } from "../../repository/user.repo.js";
import { getListRoomsGroup } from "../Message/room.service.js";



export const findUserByPhoneNumber = async (phoneNumber, userId, type = 'accepted') => {
    const viewerId = convertToObjectIdMongoose(userId);
    const users = await userModel.aggregate([
        // (tuỳ chọn) lọc theo phone + loại trừ chính mình
        {
            $match: {
                usr_phone: { $regex: phoneNumber, $options: "i" },
                _id: { $ne: viewerId }
            }
        },
        {
            $lookup: {
                from: "Friendships",
                let: { candidateId: "$_id", viewerId: viewerId },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $or: [
                                            {
                                                $and: [
                                                    { $eq: ["$frp_userId1", "$$candidateId"] },
                                                    { $eq: ["$frp_userId2", "$$viewerId"] }
                                                ]
                                            },
                                            {
                                                $and: [
                                                    { $eq: ["$frp_userId2", "$$candidateId"] },
                                                    { $eq: ["$frp_userId1", "$$viewerId"] }
                                                ]
                                            }
                                        ]
                                    },
                                ],
                            }
                        }
                    },
                    { $limit: 1 }
                ],
                as: "friendship"
            }
        },
        // Ép mảng -> object đầu tiên để dễ match status
        {
            $addFields: {
                friendship: { $arrayElemAt: ["$friendship", 0] }
            }
        },
        // Điều kiện động
        {
            $match: type === "accepted"
                ? { "friendship.frp_status": "accepted" } // có quan hệ accepted
                : { friendship: { $eq: null } }          // chưa có quan hệ (lookup rỗng)
        },
        // (tuỳ chọn) phân trang
        { $limit: 20 }
    ]);


    return users.map(user => {
        return omitInfoData({ fields: OmitUser, object: removePrefixFromKeys(user, "usr_") });
    });
}


export const findUserById = async (Id, userId) => {
    const findUser = await userFindById(Id);
    if (!findUser) {
        throw new BadRequestError("User not found");
    }
    const user = removePrefixFromKeys(findUser, "usr_");
    const checkFriendship = await checkrelationship(userId, findUser._id);
    return {
        user: omitInfoData({ fields: OmitUser, object: user }),
        friendship: checkFriendship
    }
}

export const listFriends = async (userId, options) => {
    const userIds = await getFriendIdsOfUser(userId, options);

    const friends = await userModel.find({ _id: { $in: userIds } });
    return friends.map(friend => {
        return omitInfoData({ fields: OmitUser, object: removePrefixFromKeys(friend.toObject(), "usr_") });
    });
}

export const updateProfileUser = async (userId, data) => {
    const addPrefix = addPrefixToKeys(data, "usr_");
    const user = await userModel.findByIdAndUpdate(userId, addPrefix, { new: true });
    if (!user) {
        throw new BadRequestError("User not found");
    }
    return removePrefixFromKeys(user.toObject(), "usr_");
}


export const listGroups = async (userId, options) => {
    return await getListRoomsGroup(userId, options);
}