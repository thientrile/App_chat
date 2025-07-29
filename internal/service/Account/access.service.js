import { compare, hash } from "bcrypt";
import { addPrefixToKeys, convertToObjectIdMongoose, isValidation, omitInfoData,randomId, removePrefixFromKeys } from "../../../pkg/utils/index.utils.js";
import userModel from "../../model/user.model.js";
import { createKeyToken } from "./key.service.js";
import { AuthFailureError, ForbiddenError, getErrorMessageMongose } from "../../../pkg/response/error.js";
import { userDeleteByUserId, userFindByusername } from "../../repository/user.repo.js";
import { createTokenPair } from "../../../pkg/token/utils.js";
import { adddJitToKeyToken, tkn_deleteOne } from "../../repository/key.repo.js";
import { pushToArray, setData } from "../../../pkg/redis/utils.js";
import { keyRedisLogout } from "../../../pkg/cache/cache.js";
import notificationModel from "../../model/notification.model.js";
import { OmitUser } from "../../output/user.js";


const registerAccount = async (body) => {
  let data = {}
  const { username, password, fullname, gender } = body;
  data.salt = await hash(password, 10);
  data.fullname = fullname;
  data.avatar = `https://ui-avatars.com/api/?name=${fullname.replace(" ", "-")}&background=random`
  if (isValidation.isEmail(username)) {
    data.email = username;
  } else if (isValidation.isPhoneNumber(username)) {
    data.phone = username;
  }
  data.slug=fullname.replace(" ", "_").toLowerCase() + `_${randomId()}`;
  data.gender = gender;
  const newUser = await userModel.create(addPrefixToKeys(data, "usr_")).catch((err) => {
    throw new ForbiddenError(
      getErrorMessageMongose(
        err,

        " Username or email or phone number already exists"
      )
    );
  });
  const user = removePrefixFromKeys(newUser.toObject(), "usr_");
  const tokens = await createKeyToken(newUser._id.toString());
  if (!tokens) {
    await userDeleteByUserId(newUser._id);
    throw new AuthFailureError(" Unable to create account");
  }
  return {
    user: omitInfoData({ fields: OmitUser, object: user }),
    tokens
  };

}

const loginAccount = async (payload) => {
  const { username, password } = payload;
  const user = await userFindByusername(username);

  if (!user) {
    throw new Error("User not found");
  }
  const infor = removePrefixFromKeys(user, "usr_");
  const isPasswordValid = await compare(password, user.usr_salt);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  const tokens = await createKeyToken(user._id.toString());
  if (!tokens) {
    throw new AuthFailureError("Unable to login");
  }
  return {
    user: omitInfoData({ fields: OmitUser, object: infor }),
    tokens
  };

}
const refreshToken = async (decoded) => {

  const [tokens] = await Promise.all([
    createTokenPair({ userId: decoded.userId, clientId: decoded.clientId }),
    pushToArray(keyRedisLogout(decoded.userId), decoded.sessionId),
    adddJitToKeyToken(decoded.clientId, decoded.sessionId),
  ]);
  if (!tokens) {
    throw new AuthFailureError(" Unable to refresh token");
  }
  return {
    tokens
  };
}
const logoutAccount = async (decoded) => {
  await Promise.all([
     pushToArray(keyRedisLogout(decoded.userId), decoded.sessionId),
    tkn_deleteOne({ tkn_userId: convertToObjectIdMongoose(decoded.userId), tkn_clientId: decoded.clientId })
  ])

  return true
}





export {
  registerAccount,
  loginAccount,
  refreshToken,
  logoutAccount,
}