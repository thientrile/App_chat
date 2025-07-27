

const local = {
  app: {
    name: process.env.APP_NAME || "APP_CHAT",
    version: process.env.VERSION || "1.0.0",
    description: process.env.DESCRIPTION || "This is a sample application configuration file.",
    port: process.env.PORT || 3089,
    host: process.env.HOST || "localhost",
  },
  mongodb: {
    schema: process.env.DB_CONNECTION || "mongodb",
    user: process.env.DB_USER || "root",
    pass: process.env.DB_PASSWORD || "123456",
    host: process.env.DB_HOST || "localhost:27017",
    database: process.env.DB_NAME || "AppChat",
    options: {
      authSource: "admin",
    },
  },
  redis: {
    // user: process.env.REDIS_USER || "default",
    // pass: process.env.REDIS_PASSWORD || "dKEsVLHmGmAWnyDlNoyMnYBtPDJhTfos",
    host: process.env.REDIS_HOST || "localhost:6379",
  },
  cloudinary: {
    cloud_name: "dcplqohwd",
    api_key: "945292861993721",
    api_secret: "J_ohAUV8PvwaiqTlha3ho0YZ4u4",
  },
}

const development = {
  app: {
    name: process.env.APP_NAME || "APP_CHAT",
    version: process.env.VERSION || "1.0.0",
    description: process.env.DESCRIPTION || "This is a sample application configuration file.",
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost",
  },
  mongodb: {
    schema: process.env.DB_CONNECTION_DEV || "mongodb",
    user: process.env.DB_USER_DEV || "mongo",
    pass: process.env.DB_PASSWORD_DEV || "JbRhebwthEmdazawqbuhHoJPZujyzIMq",
    host: process.env.DB_HOST_DEV || "ballast.proxy.rlwy.net:15545",
    database: process.env.DB_NAME_DEV || "AppChat",
    options: {
      authSource: "admin",
    },
  },
  redis: {
    user:"default",
    pass: "dKEsVLHmGmAWnyDlNoyMnYBtPDJhTfos",
    host:  "trolley.proxy.rlwy.net:31429",
  },
  cloudinary: {
    cloud_name: "dcplqohwd",
    api_key: "945292861993721",
    api_secret: "J_ohAUV8PvwaiqTlha3ho0YZ4u4",
  },
};

const production = {
  app: {
    name: process.env.APP_NAME || "APP_CHAT",
    version: process.env.VERSION || "1.0.0",
    description: process.env.DESCRIPTION || "This is a sample application configuration file.",
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost",
  },
  mongodb: {
    schema: process.env.DB_CONNECTION_PROD || "mongodb",
    user: process.env.DB_USER_PROD || "mongo",
    pass: process.env.DB_PASSWORD_PROD || "JbRhebwthEmdazawqbuhHoJPZujyzIMq",
    host: process.env.DB_HOST_PROD || "mongodb.railway.internal:27017",
    database: process.env.DB_NAME_PROD || "AppChat",
    options: {
      authSource: "admin",
    },
  },
  cloudinary: {
    cloud_name: "dcplqohwd",
    api_key: "945292861993721",
    api_secret: "J_ohAUV8PvwaiqTlha3ho0YZ4u4",
  },
  redis: {
    user: process.env.REDIS_USER_PROD || "default",
    pass: process.env.REDIS_PASSWORD_PROD || "dKEsVLHmGmAWnyDlNoyMnYBtPDJhTfos",
    host: process.env.REDIS_HOST_PROD || "redis.railway.internal:6379",
  },
};
const config = { production, development, local };
const env = process.env.NODE_ENV || "local";
console.log("NODE_ENV::: ", env);

export default config[env];
