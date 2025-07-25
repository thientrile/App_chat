// pkg/firebase/initFirebase.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import { systemLogger } from "../../pkg/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../storage/firebase/app-chat.json"), "utf8")
);

 const initFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    systemLogger.startup("Firebase", "Initialized");
  } else {
    systemLogger.shutdown("Firebase", "Already initialized");
  }
};
export default initFirebase;