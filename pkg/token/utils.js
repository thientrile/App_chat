import { readFileSync } from "node:fs";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { EncryptJWT, importSPKI } from "jose";
import { randomUUID } from "node:crypto";
const createTokenPair = async (payload) => {
    const publicKeyPem = readFileSync(
        path.resolve(process.cwd(), "./storage/public.pem"),
        "utf8"
    );
    const publicKey = await importSPKI(publicKeyPem, "RSA-OAEP");
    const jit = randomUUID();
    payload.jit = jit;
    const accessToken = await new EncryptJWT(payload)
        .setProtectedHeader({ alg: "RSA-OAEP", enc: "A256GCM" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .encrypt(publicKey);

    const refreshToken = await new EncryptJWT({ ...payload, refresh: true })
        .setProtectedHeader({ alg: "RSA-OAEP", enc: "A256GCM" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .encrypt(publicKey);

    return { accessToken, refreshToken };
};
export { createTokenPair };