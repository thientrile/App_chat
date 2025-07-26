export const chatHandler = (socket, io) => {
  socket.on("chat:send", ({groupId,userId,msg}) => {
    console.log("💬 Message:", msg);
    io.to(groupId).emit("chat:receive", {userId, msg});
  });
};
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
  socket.on("room:message", ({ groupId, text }) => {
     socket.join(groupId);
    console.log(`💬 [${groupId}] user: ${socket.decoded.userId}: ${text}`);
    io.to(groupId).emit("room:message", {
      user: socket.decoded.userId,
      text,
      sentAt: new Date().toISOString(),
    });
  });
};
