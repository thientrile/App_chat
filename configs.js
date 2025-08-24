// // config.js
// import dotenv from "dotenv";
// dotenv.config();

const ENV = process.env.NODE_ENV || "local";
console.log("NODE_ENV :::", ENV);

// Helper function để load biến có prefix theo env
const getEnv = (key, fallback) => {
  const fullKey = `${ENV.toUpperCase()}_${key}`;
  return process.env[fullKey] || process.env[key] || fallback;
};

const config = {
  app: {
    name: process.env.APP_NAME || "APP_CHAT",
    version: process.env.VERSION || "1.0.0",
    description: process.env.DESCRIPTION || "This is a sample application configuration file.",
    port: parseInt(process.env.PORT, 10) || (ENV === "local" ? 3089 : 3000),
    host: process.env.HOST || "localhost",
  },

  mongodb: {
    schema: getEnv("DB_CONNECTION", "mongodb"),
    user: getEnv("DB_USER", "root"),
    pass: getEnv("DB_PASSWORD", "123456"),
    host: getEnv("DB_HOST", "localhost:27017"),
    database: getEnv("DB_NAME", "AppChat"),
    options: {
      authSource: "admin",
    },
  },

  redis: {
    user: getEnv("REDIS_USER", ""), // cho local không cần auth
    pass: getEnv("REDIS_PASSWORD", ""),
    host: getEnv("REDIS_HOST", "localhost:6379"),
  },

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_NAME || "dcplqohwd",
    api_key: process.env.CLOUDINARY_API_KEY || "945292861993721",
    api_secret: process.env.CLOUDINARY_API_SECRET || "J_ohAUV8PvwaiqTlha3ho0YZ4u4",
  },

  firebase: {
    type: process.env.FIREBASE_TYPE || "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
    token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com"
  },
};

export default config;
