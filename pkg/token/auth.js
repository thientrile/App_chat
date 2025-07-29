import { readFileSync } from "fs";
import path from "path";
import { jwtDecrypt, importPKCS8 } from "jose";
import { webcrypto } from "crypto"; // 👈 Thêm dòng này

// Gán `crypto.subtle` cho môi trường Node.js
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

import { AuthFailureError, ForbiddenError } from "../response/error.js";
import headers from "../context/header.js";
import { getArray, getData } from "../redis/utils.js";
import { keyRedisLogout } from "../cache/cache.js";
import { tkn_checkKeyTokenVerify } from "../../internal/repository/key.repo.js";

// Load private key từ file
const privateKeyPem = readFileSync(
  path.resolve(process.cwd(), "./storage/private.pem"),
  "utf8"
);

// Giải mã private key để dùng với jwtDecrypt
const privateKey = await importPKCS8(privateKeyPem, "RSA-OAEP");

const authertication = async (req, res, next) => {
  try {
    let token =
      req.headers[headers.REFRESHTOKEN] || req.headers[headers.AUTHORIZATION];
    if (!token) throw new AuthFailureError("Token has expired");

    let decrypted;
    try {
      const { payload } = await jwtDecrypt(
        token.replace(/^Bearer\s+/i, ""),
        privateKey
      );
      decrypted = payload;
    } catch (err) {
      console.error("Error decrypting token:", err.message);
      throw new AuthFailureError("Token has expired");
    }
    console.log(decrypted.clientId);
    const keyStore = await tkn_checkKeyTokenVerify(decrypted.clientId);
    if (!keyStore) throw new AuthFailureError("Token has expired");

    const userId = keyStore.tkn_userId.toString();
    if (userId !== decrypted.userId) throw new AuthFailureError("Token has expired");

    const logout = await getArray(keyRedisLogout(userId));
    if (logout.includes(decrypted.sessionId) || keyStore.tkn_jit.includes(decrypted.sessionId)) {
      throw new AuthFailureError("Token has expired");
    }

    // Token hợp lệ
    req.token = token;
    req.decoded = decrypted;
    req.userId = userId;

    next();
  } catch (err) {
    return next(err);
  }
};

export default authertication;
