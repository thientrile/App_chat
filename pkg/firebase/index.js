var admin = require("firebase-admin");

var serviceAccount = require("./storage/app_chat.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Gửi thông báo tin nhắn đến các thiết bị qua Firebase Cloud Messaging
 * @param {string[]} tokens - Mảng các token thiết bị
 * @param {Object} messageData - Dữ liệu tin nhắn
 * @param {string} messageData.title - Tiêu đề tin nhắn
 * @param {string} messageData.body - Nội dung tin nhắn
 * @param {Object} messageData.data - Dữ liệu bổ sung
 * @returns {Promise<Object>} Kết quả gửi thông báo
 */
const pushMessage = async (tokens, messageData) => {
  try {
    if (!tokens || tokens.length === 0) {
      throw new Error('Không có token thiết bị được cung cấp');
    }

    const message = {
      notification: {
        title: messageData.title,
        body: messageData.body,
      },
      data: messageData.data || {},
      tokens: tokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'chat_messages'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendMulticast(message);
    return {
      success: response.successCount,
      failure: response.failureCount,
      results: response.responses,
    };
  } catch (error) {
    console.error('Lỗi khi gửi thông báo:', error);
    throw error;
  }
};

export default pushMessage; // cũng có thể dùng export default nếu cần