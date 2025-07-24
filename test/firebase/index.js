// internal/testFirebase.js

import { initFirebase } from "../../internal/initializes/firebase.ini.js";
import { pushMessage } from "../../pkg/firebase/index.js";

initFirebase();

const test = async () => {
  const tokens = [
    "dF1QnGAYRESNKgGGZqVvD2:APA91bHgu3fZPaF6ScMw9xwxW0drN2eoodqd0_iHKBKPSnlj93V_1ZwoUYOtQ2SFBcCJKq4Bx9d42VNmKvngj--8a2iSEvsOOmytPbw3FntgHGxaErFfMNg",
  ];

  const message = {
    title: "🧪 Kiểm tra gửi FCM",
    body: "Nếu bạn thấy cádfsfi này là đã thành công!",
    data: {
      roomId: "123",
      userId: "456",
    },
  };

  try {
    const result = await pushMessage(tokens, message);
    console.log("✅ Kết quả:", result);
  } catch (err) {
    console.error("🔥 Gửi thất bại:", err.message);
  }
};

test();
