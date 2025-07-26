import { readFileSync } from "fs";
import path from "path";
import { jwtDecrypt, importPKCS8 } from "jose";
import { webcrypto } from "crypto";

import { AuthFailureError, ForbiddenError } from "../response/error.js";
import headers from "../context/header.js";
import { getData } from "../redis/utils.js";
import { keyRedisLogout } from "../cache/cache.js";
import { tkn_checkKeyTokenVerify } from "../../internal/repository/key.repo.js";

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

    const logout = await getData(keyRedisLogout(userId, decrypted.jit));
    if (logout || keyStore.tkn_jit.includes(decrypted.jit)) {
      throw new AuthFailureError("Token has expired");
    }

    // ✅ Gán user info vào socket
    socket.token = token;
    socket.decoded = decrypted;

    return next();
  } catch (err) {
    console.error("❌ Socket auth failed:", err.message);
    return next(new AuthFailureError("Unauthorized socket connection"));
  }
};
