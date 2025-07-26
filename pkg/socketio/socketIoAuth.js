import { readFileSync } from "fs";
import path from "path";
import { jwtDecrypt, importPKCS8 } from "jose";
import { webcrypto } from "crypto";

import { AuthFailureError, ForbiddenError } from "../response/error.js";
import headers from "../context/header.js";
import { delKey, getArray, getData, pushToArray, removeFromArray, setData } from "../redis/utils.js";
import { keyRedisLogout } from "../cache/cache.js";
import { tkn_checkKeyTokenVerify } from "../../internal/repository/key.repo.js";
import { Consts } from "../../internal/const/consts.js";

// Gán `crypto.subtle` cho Node.js
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

// Load private key 1 lần khi app khởi động
const privateKeyPem = readFileSync(
  path.resolve(process.cwd(), "./storage/private.pem"),
  "utf8"
);
const privateKey = await importPKCS8(privateKeyPem, "RSA-OAEP");

/**
 * Middleware xác thực socket
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    const headersData = socket.handshake.headers;
    let token =
      headersData[headers.REFRESHTOKEN?.toLowerCase()] ||
      headersData[headers.AUTHORIZATION?.toLowerCase()];

    if (!token) throw new AuthFailureError("Token has expired");

    // Giải mã token
    const { payload } = await jwtDecrypt(
      token.replace(/^Bearer\s+/i, ""),
      privateKey
    );

    const decrypted = payload;
    const keyStore = await tkn_checkKeyTokenVerify(decrypted.clientId);
    if (!keyStore) throw new AuthFailureError("Token has expired");

    const userId = keyStore.tkn_userId.toString();
    if (userId !== decrypted.userId) throw new AuthFailureError("Token has expired");

   const logout = await getArray(keyRedisLogout(userId));
    if (logout.includes(decrypted.jit) || keyStore.tkn_jit.includes(decrypted.jit)) {
      throw new AuthFailureError("Token has expired");
    }

    // ✅ Gán user info vào socket
    socket.token = token;
    socket.decoded = decrypted;
    await setData(`user_sockets:${decrypted.userId}`, socket.id);
    await pushToArray(Consts.ONLINE_USERS_KEY, decrypted.userId);
    return next();
  } catch (err) {
    console.error("❌ Socket auth failed:", err.message);
    return next(new AuthFailureError("Unauthorized socket connection"));
  }
};


export const socketDisconnectMiddleware = async (socket, next) => {
  console.log(`💨 [SOCKET] Disconnected: ${socket.id}`);
  console.log(`💤 ${socket.decoded.userId} đã offline`);
  await delKey(`user_sockets:${socket.decoded.userId}`);
  // 3. Nếu user không còn socket nào → offline
  const userSocketList = await getArray(Consts.ONLINE_USERS_KEY);
  const stillOnline = userSocketList && userSocketList.length > 0;

  if (!stillOnline) {
    // 3. Không còn socket nào → xem như user offline → xoá khỏi danh sách online
    await removeFromArray(Consts.ONLINE_USERS_KEY, socket.decoded.userId);
    console.log(`🚪 User ${socket.decoded.userId} đã OFFLINE toàn bộ.`);
  } else {
    console.log(`🟢 User ${socket.decoded.userId} vẫn còn ${userSocketList.length} socket khác.`);
  }
  // next();
}
