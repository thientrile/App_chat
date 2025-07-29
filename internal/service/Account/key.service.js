import { randomUUID } from "crypto";
import { createTokenPair } from "../../../pkg/token/utils.js";
import { convertToObjectIdMongoose } from "../../../pkg/utils/index.utils.js";
import keyModel from "../../model/key.model.js";
import { updateFcmToken } from "../../repository/key.repo.js";
const createKeyToken = async (userId) => {
  const clientId = randomUUID();
  const [tokens,key] = await Promise.all([
    createTokenPair({ userId, clientId }),
    keyModel.create({
      tkn_userId: convertToObjectIdMongoose(userId),
      tkn_clientId: clientId,
    }),
  ]);
  console.log("🚀 ~ createKeyToken ~ key:", key)
  return tokens;

};
const setFcmToken = async (clientId, fctoken) => {
 const newKey= await updateFcmToken(clientId, fctoken);
  if (!newKey) {
      throw new Error("Unable to set Firebase token");
    }
    return true;
}

export {
  createKeyToken,
  setFcmToken
}


