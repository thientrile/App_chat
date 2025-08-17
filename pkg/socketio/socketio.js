import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";

/**
 * Khởi tạo Socket.IO server sử dụng Redis Adapter
 * @param {http.Server} httpServer - HTTP server để attach socket.io vào
 * @param {RedisClientType} RedisClient - Redis client đã được tạo
 * @param {Function[]} socketMiddlewares - Mảng các middleware cho socket
 * @param {Function[]} socketHandlers - Mảng các hàm xử lý socket, mỗi hàm nhận socket làm tham số
 * @returns {Promise<Server>} - Trả về instance io
 */
export async function initSocketIO(httpServer, RedisClient, socketMiddlewares = [], socketConnHandlers = [], socketDisconnHandlers = []) {
  const pubClient = RedisClient;
  const subClient = pubClient.duplicate();

  // Connect cả pub và sub nếu chưa kết nối
  if (!pubClient.isOpen) await pubClient.connect();
  if (!subClient.isOpen) await subClient.connect();

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // <-- Gfi nên đổi sang domain cụ thể trong prod
      methods: ["GET", "POST"],
    },
  });

  // Redis adapter để scale socket
  io.adapter(createAdapter(pubClient, subClient));

  for (const middleware of socketMiddlewares) {
    if (typeof middleware === "function") {
      io.use(async (socket, next) => {
        try {
          await middleware(socket, next);
        } catch (err) {
          console.error("❌ Middleware error:", err.message);
          next(err); // Hoặc emit lỗi tùy ý
        }
      });
    }
  }
  // Sự kiện khi client kết nối
  io.on("connection", (socket) => {
    console.log(`🔥 [SOCKET] Connected: ${socket.id}`);

    // Gọi từng handler được truyền vào
    for (const handler of socketConnHandlers) {
      if (typeof handler === "function") {
        handler(socket, io); // Truyền thêm io nếu cần emit toàn cục
      }
    }

    socket.on("disconnect", async () => {
      
      console.log(`💨 [SOCKET] Disconnected: ${socket.id}`);
      for (const handler of socketDisconnHandlers) {
        if (typeof handler === "function") {
          try {
            await handler(socket, io); // Giả sử handler là async
          } catch (err) {
            console.error("❌ Disconnect handler error:", err);
          }
        }
      }

    });
  });

  // Có thể lưu global để gọi emit từ service khác
  global.IO = io;

  console.log("✅ Socket.IO initialized with Redis adapter.");
}
