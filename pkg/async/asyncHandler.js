const asyncHandler = (fn) => {
  return (req, res, next) => {

    fn(req, res, next).catch(next);
  };
};
const socketAsyncHandler = (fn) => {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (err) {
      const socket = args[0]?.socket || args[0]; // tùy vào kiểu args
      socket.emit('error:global', { message: err.message });
    }
  };
};

export  {
  asyncHandler,
  socketAsyncHandler
};
