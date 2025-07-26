

global.IO.on("connection", (socket) => {
    console.log(`🔥 [SOCKET] Connected: ${socket.id}`);

    socket.on("test", (room) => {
        console.log(`🚪 ${socket.id} joined room ${room.userId}`);
        socket.join(room);
    });

    socket.on("disconnect", () => {
        console.log(`💨 [SOCKET] Disconnected: ${socket.id}`);
    });
});