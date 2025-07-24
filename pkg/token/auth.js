
import { readFileSync } from "fs";
import path from "path";
import { jwtDecrypt, importPKCS8 } from "jose";
import { AuthFailureError, ForbiddenError } from "../response/error.js";
import headers from "../context/header.js";
import { getData } from "../redis/utils.js";
import { keyRedisLogout } from "../cache/cache.js";
import { tkn_checkKeyTokenVerify } from "../../internal/repository/key.repo.js";

// Đọc private key để giải mã (Decrypt)
const privateKeyPem = readFileSync(
  path.resolve(process.cwd(), "./storage/private.pem"),
  "utf8"
);
const privateKey = await importPKCS8(privateKeyPem, "RSA-OAEP");

const authertication = async (req, res, next) => {
  try {
   

    let token =
      req.headers[headers.REFRESHTOKEN] || req.headers[headers.AUTHORIZATION];
    if (!token) throw new AuthFailureError("Token has expired");

    let decrypted;
    try {
      const { payload } = await jwtDecrypt(token.replace(/^Bearer\s+/i, ""), privateKey);
      decrypted = payload;
    } catch (err) {
      console.error("Error decrypting token:", err.message);
      throw new AuthFailureError("Token has expired");
    }
    const keyStore = await tkn_checkKeyTokenVerify(decrypted.clientId);
    if (!keyStore) throw new AuthFailureError("Token has expired");
    
    const userId = keyStore.tkn_userId.toString();
    if (userId !== decrypted.userId) throw new AuthFailureError("Token has expired");
    const logout = await getData(keyRedisLogout(userId, decrypted.jit));
    if (logout || keyStore.tkn_jit.includes(decrypted.jit)) {
      throw new AuthFailureError("Token has expired");
    }
    
    
    req.token = token;
    req.decoded = decrypted;

  } catch (err) {
    return next(err);
  }
  next();
};

export default authertication;
