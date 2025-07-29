import { checkOnlineUser } from "../../../pkg/cache/cache.js";
import { userFindById } from "../../repository/user.repo.js";




export const checkUserIshasOnline = async (Id) => {
    const findUser = await userFindById(Id);
    console.log("🚀 ~ checkUserIshasOnline ~ findUser:", findUser)
    if (!findUser) {
        throw new Error("User not found");
    }
    const checkOnline= await checkOnlineUser(findUser._id.toString());
    console.log("🚀 ~ checkUserIshasOnline ~ checkOnline:", checkOnline)
    return checkOnline===1;
}