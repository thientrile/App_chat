import { socketAsyncHandler } from "../../pkg/async/asyncHandler.js";
import { checkUserIshasOnline } from "../service/Connect/connect.service.js";
import { sendMessageToRoom } from "../service/Message/message.service.js";

export const chatRoomHandler = (socket, io) => {
  // Khi client yêu cầu tham gia room
  socket.on("room:join", ({ groupId }) => {
    socket.join(groupId);
    console.log(`✅ ${socket.decoded.userId} (${socket.id}) đã tham gia room: ${groupId}`);

    // Gửi cho người khác trong phòng biết
    socket.to(groupId).emit("room:user-joined", {
      user: socket.decoded.userId,
      message: `${socket.decoded.userId} vừa tham gia phòng`,
    });
  });

  // Khi client rời room
  socket.on("room:leave", ({ groupId }) => {
    socket.leave(groupId);
    console.log(`🚪 ${socket.decoded.userId} (${socket.id}) đã rời room: ${groupId}`);
    console.log(socket.decoded);
    // Gửi cho người khác trong phòng biết
    socket.to(groupId).emit("room:user-left", {
      user: socket.decoded.userId,
      message: `${socket.decoded.userId} đã rời khỏi phòng`,
    });
  });

  // Khi gửi tin nhắn đến room
  socket.on("room:message", async (payload, ack) => {
    await sendMessageToRoom(payload, ack);
  });
};


export const chatHandler = (socket, io) => {
  socket.on("user_online", async ({ id }) => {
    const isOnline = await checkUserIshasOnline(id)
    console.log("🚀 ~ chatHandler ~ isOnline:", isOnline)
    io.emit("user_online", { id, isOnline });
  });
};