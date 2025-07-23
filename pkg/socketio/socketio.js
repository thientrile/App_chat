import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";

export async function initSocketIO(httpServer, RedisClient) {
  const pubClient = RedisClient;
  const subClient = pubClient.duplicate();

  // Chỉ connect subClient thôi
  if (!subClient.isOpen) {
    await subClient.connect();
  }

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // <-- Đặt cụ thể nếu biết frontend
    },
  });

  io.adapter(createAdapter(pubClient, subClient));

  io.on("connection", (socket) => {
    console.log(`🔥 [SOCKET] Connected: ${socket.id}`);
  
    socket.on("test", (room) => {
      console.log(`🚪 ${socket.id} joined room ${room.userId}`);
      socket.join(room);
    });

    socket.on("disconnect", () => {
      console.log(`💨 [SOCKET] Disconnected: ${socket.id}`);
    });
  });

  global.IO = io;
  console.log("✅ Socket.IO initialized and stored in global.IO");
}
