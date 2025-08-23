// socket/SocketSuccessResponse.js
export class SocketSuccessResponse {
  /**
   * @param {Object} opts
   * @param {string=} opts.message
   * @param {number=} opts.statusCode     // mặc định 200
   * @param {string=} opts.reasonCode     // ví dụ 'OK'
   * @param {any=}    opts.data           // dữ liệu trả về
   * @param {number=} opts.ts             // timestamp ms
   */
  constructor({
    message,
    statusCode = 200,
    reasonCode = 'OK',
    metadata = {},
    ts = Date.now(),
  } = {}) {
    this.ok = true;
    this.status = statusCode;
    this.code = reasonCode;
    this.message = message ?? reasonCode;
    this.metadata = metadata;
    this.ts = ts;
  }

  payload() {
    const { ok, message, status, code, metadata, ts } = this;
    return { ok, message, status, code, metadata, ts };
  }

  /** Ưu tiên dùng với callback ack của client */
  ack(ack) {
    if (typeof ack === 'function') {
      try { ack(this.payload()); } catch (_) {}
    }
    return this;
  }

  /** Emit về chính socket (unicast) */
  emit(socket, event) {
    if (!socket || !event) throw new Error('emit(socket, event) cần đủ tham số');
    socket.emit(event, this.payload());
    return this;
  }

  /** Gửi cho tất cả client khác (broadcast) */
  broadcast(socket, event) {
    if (!socket || !event) throw new Error('broadcast(socket, event) cần đủ tham số');
    socket.broadcast.emit(event, this.payload());
    return this;
  }

  /** Gửi tới room (mọi người trong phòng, trừ sender) */
  to(socket, room, event) {
    if (!socket || !room || !event) throw new Error('to(socket, room, event) cần đủ tham số');
    socket.to(room).emit(event, this.payload());
    return this;
  }

  /** Gửi tới nhiều room */
  toMany(socket, rooms = [], event) {
    if (!socket || !event) throw new Error('toMany(socket, rooms, event) cần đủ tham số');
    let chain = socket;
    for (const r of (Array.isArray(rooms) ? rooms : [rooms])) chain = chain.to(r);
    chain.emit(event, this.payload());
    return this;
  }

  // tiện dụng
  static ok({ metadata = {}, message = 'OK' }) {
    return new SocketSuccessResponse({ metadata, message });
  }
}
