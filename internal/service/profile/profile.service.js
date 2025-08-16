import { omitInfoData, removePrefixFromKeys } from "../../../pkg/utils/index.utils.js";
import userModel from "../../model/user.model.js";
import { OmitUser } from "../../output/user.js";
import { checkrelationship, getFriendIdsOfUser } from "../../repository/friendship.repo.js";
import { userFindById } from "../../repository/user.repo.js";



export const findUserByPhoneNumber = async (phoneNumber, userId) => {
    const findUser = await userModel.findOne({ usr_phone: phoneNumber });
    if (!findUser) {
        throw new Error("User not found");
    }
    const user = removePrefixFromKeys(findUser.toObject(), "usr_");
    const checkFriendship = await checkrelationship(userId, findUser._id.toString());
    return {
        user: omitInfoData({ fields: OmitUser, object: user }),
        friendship: checkFriendship
    }

}


export const findUserById = async (Id, userId) => {
    const findUser = await userFindById(Id);
    if (!findUser) {
        throw new Error("User not found");
    }
    const user = removePrefixFromKeys(findUser, "usr_");
    const checkFriendship = await checkrelationship(userId, findUser._id);
    return {
        user: omitInfoData({ fields: OmitUser, object: user }),
        friendship: checkFriendship
    }
}

export const listFriends = async (userId, options) => {
    const userIds = await getFriendIdsOfUser(userId,options);

    const friends = await userModel.find({ _id: { $in: userIds } });
    return friends.map(friend => {
        return omitInfoData({ fields: OmitUser, object: removePrefixFromKeys(friend.toObject(), "usr_") });
    });
}