// internal/testFirebase.js

import { initFirebase } from "../../internal/initializes/firebase.ini.js";
import { pushMessage } from "../../pkg/firebase/index.js";

initFirebase();

const test = async () => {
  const tokens = [
    "d2-lJp6tQca0qEjXWRfsu_:APA91bFpK4t8iTmZx41u5u555PsDuGzrs9X4vc_pgzxynrFMbCPIrtzvKjMX2WBBl_of4CZNDOo3QIN2bjkoHiMwLgFIqa1rrPMAH6rI77rfTDWcAd7FJMQ",
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
