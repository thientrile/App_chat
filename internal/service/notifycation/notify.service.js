import { pushMessage } from "../../../pkg/firebase/index.js";
import notificationModel from "../../model/notification.model.js";
import { getAllFcmToken } from "../../repository/key.repo.js";



export const sendNotifyForUser = async (notifyObje = {}, messageSend = {}) => {
    const { notif_user_receive } = notifyObje;
    const fcmTokens = await getAllFcmToken(notif_user_receive);
    const [notification] = await Promise.all([
        notificationModel.create(notifyObje),
        pushMessage(fcmTokens, messageSend)
    ])

    return notification

}