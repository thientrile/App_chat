// pkg/firebase/initFirebase.js
import admin from "firebase-admin";
import { systemLogger } from "../../pkg/logger/index.js";
import config from "../../configs.js";

const initFirebase = () => {
  if (!admin.apps.length) {
    try {
      // Sử dụng config từ biến môi trường
      const serviceAccount = {
        type: config.firebase.type,
        project_id: config.firebase.project_id,
        private_key_id: config.firebase.private_key_id,
        private_key: config.firebase.private_key,
        client_email: config.firebase.client_email,
        client_id: config.firebase.client_id,
        auth_uri: config.firebase.auth_uri,
        token_uri: config.firebase.token_uri,
        auth_provider_x509_cert_url: config.firebase.auth_provider_x509_cert_url,
        client_x509_cert_url: config.firebase.client_x509_cert_url,
        universe_domain: config.firebase.universe_domain
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      systemLogger.startup("Firebase", "Initialized successfully with environment config");
    } catch (error) {
      systemLogger.error("Firebase", `Initialization failed: ${error.message}`);
      throw error;
    }
  } else {
    systemLogger.shutdown("Firebase", "Already initialized");
  }
};
export default initFirebase;