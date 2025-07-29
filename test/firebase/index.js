// internal/testFirebase.js

import  initFirebase  from "../../internal/initializes/firebase.ini.js";
import { pushMessage } from "../../pkg/firebase/index.js";

initFirebase();

const test = async () => {
  const tokens = [
    "eBae0ZXTR_uc23CuAbkvp2:APA91bFtu0lv4aLCoxbfOl5ZlNtKj_VTDVu0ARTbBuyLvcbPcqXx_LtDRWNV4vKrY3lXJdh2I-T_EtKfU0ZW3jcc-epxMW__0ENLnTbDzkM0xIWtTi6UhrU",
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
