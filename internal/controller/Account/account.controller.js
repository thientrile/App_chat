import { SuccessReponse } from "../../../pkg/response/success.js";
import { loginAccount, logoutAccount, refreshToken, registerAccount } from "../../service/Account/access.service.js";
import { setFcmToken } from "../../service/Account/key.service.js";
import { updateProfile } from "../Profile/profile.controller.js";




const LoginAccount= async (req, res) => {
    new SuccessReponse({
        message: "Login successfully",
        metadata: await loginAccount(req.body)
    }).send(res);
}

const RegisterAccount = async (req, res) => {
    new SuccessReponse({
        message: "Register successfully",
        metadata: await registerAccount(req.body)
    }).send(res);
}

const RefreshToken = async (req, res) => {
  
    new SuccessReponse({
        message: "Refresh token successfully",
        metadata: await refreshToken(req.decoded)
    }).send(res);
}


const LogoutAccount = async (req, res) => {
    new SuccessReponse({
        message: "Logout successfully",
        metadata: await logoutAccount(req.decoded)
    }).send(res);
}


const SetFirebaseToken = async (req, res) => {
    new SuccessReponse({
        message: "Set Firebase token successfully",
        metadata: await setFcmToken(req.decoded.clientId, req.body.token)
    }).send(res);
}

const UpdateAccount = async (req, res) => {
    new SuccessReponse({
        message: "Update profile successfully",
        metadata: await updateProfile(req.decoded.userId, req.body)
    }).send(res);
}

export {
    LoginAccount,
    SetFirebaseToken,
    RegisterAccount,
    RefreshToken,
    LogoutAccount,
    UpdateAccount
}