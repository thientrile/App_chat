import admin from "firebase-admin"
export const pushMessage = async (tokens, messageData) => {
  try {
    if (!admin.apps.length) throw new Error("Firebase chưa được khởi tạo.");
    if (!tokens?.length) throw new Error("Không có token thiết bị.");

    const message = {
      tokens,
      notification: {
        title: messageData.title,
        body: messageData.body,
      },
      data: Object.fromEntries(
        Object.entries(messageData.data || {}).map(([k, v]) => [k, String(v)])
      ),
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "chat_messages",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
console.log(
  JSON.stringify(
    response.responses.map((r) => ({
      success: r.success,
      error: r.error ? r.error.message : null,
      code: r.error ? r.error.code : null,
    })),
    null,
    2
  )
);
    return {
      success: response.responses.filter(r => r.success).length,
      failure: response.responses.filter(r => !r.success).length,
      responses: response.responses,
    };
  } catch (err) {
    console.error("❌ pushMessage lỗi:", err.message);
    throw err;
  }
};
