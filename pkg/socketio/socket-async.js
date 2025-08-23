// socket/socket-async.js
import { serializeSocketError } from './socket-errors.js';

/**
 * Dùng: socket.on('event', socketAsync(socket, handler, { successEvent }))
 * - Nếu client truyền ack -> ưu tiên ack({ ok:true|false, ... })
 * - Nếu không có ack -> lỗi: emit('error:global'), thành công: emit successEvent (nếu cấu hình)
 */
export const socketAsync = (socket, handler, opts = {}) => {
  const { successEvent } = opts;

  return async (...args) => {
    const last = args[args.length - 1];
    const ack = typeof last === 'function' ? last : undefined;
    const payload = args[0];

    try {
      const data = await handler({ socket, payload, args, ack });

      if (ack) return ack({ ok: true, data, ts: Date.now() });
      if (successEvent) socket.emit(successEvent, { ok: true, data, ts: Date.now() });

    } catch (err) {
      console.error('[SOCKET_ERROR]', err);
      const res = serializeSocketError(err);

      if (ack) {
        try { return ack(res); } catch (_) {}
      }
      socket.emit('error:global', res.error); // chỉ gửi phần error cho gọn
    }
  };
};
