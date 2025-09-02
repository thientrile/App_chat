import { socketAsync } from "../../pkg/socketio/socket-async.js";
import { SktAcceptCall, SktIncomingCall, SktReadedMsg, SktRejectCall, SktSendMsg, SktWebRTC } from "../controller/Message/message.controller.js";
import { findRoomById } from "../repository/room.reop.js";
import { checkUserIshasOnline } from "../service/Connect/connect.service.js";
import { sendMessageToRoom } from "../service/Message/message.service.js";

export const chatRoomHandler = (socket, io) => {
  // // Khi client yêu cầu tham gia room
  // socket.on("room:join", ({ groupId }) => {
  //   socket.join(groupId);
  //   console.log(`✅ ${socket.decoded.userId} (${socket.id}) đã tham gia room: ${groupId}`);

  //   // Gửi cho người khác trong phòng biết
  //   socket.to(groupId).emit("room:user-joined", {
  //     user: socket.decoded.userId,
  //     message: `${socket.decoded.userId} vừa tham gia phòng`,
  //   });
  // });

  // // Khi client rời room
  // socket.on("room:leave", ({ groupId }) => {
  //   socket.leave(groupId);
  //   console.log(`🚪 ${socket.decoded.userId} (${socket.id}) đã rời room: ${groupId}`);
  //   console.log(socket.decoded);
  //   // Gửi cho người khác trong phòng biết
  //   socket.to(groupId).emit("room:user-left", {
  //     user: socket.decoded.userId,
  //     message: `${socket.decoded.userId} đã rời khỏi phòng`,
  //   });
  // });

  // Khi gửi tin nhắn đến room
  socket.on("room:send:message", socketAsync(socket, async ({ payload }) => {

    await SktSendMsg({ socket, payload });
  }));
  socket.on("room:read:message", socketAsync(socket, async ({ payload }) => {
    await SktReadedMsg({ socket, payload });
  }))
};


export const chatHandler = (socket, io) => {
  socket.on("user_online", async ({ id }) => {
    const isOnline = await checkUserIshasOnline(id)
    console.log("🚀 ~ chatHandler ~ isOnline:", isOnline)
    io.emit("user_online", { id, isOnline });
  });
};


export const handleCall = (socket, io) => {
  // Sự kiện gọi đến người dùng
  socket.on("call:invite", socketAsync(socket, async ({ payload }) => {
    await SktIncomingCall({ socket, payload });
  }));
  // Sự kiện chấp nhận cuộc gọi
  socket.on("call:accept", socketAsync(socket, async ({ payload }) => {
    await SktAcceptCall({ socket, payload });
  }));
  // Sự kiện từ chối cuộc gọi, kết thúc cuộc gọi
  socket.on("call:reject", socketAsync(socket, async ({ payload }) => {
    await SktRejectCall({ socket, payload });
  }));
  // Sự kiện bắn tín hiệu
  socket.on("call:signal", socketAsync(socket, async ({ payload }) => {
    await SktWebRTC({ socket, payload });
  }));
}