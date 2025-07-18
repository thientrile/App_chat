const devlopment = {
  app: {
    name: "MyApp",
    version: "1.0.0",
    description: "This is a sample application configuration file.",
    port: 3000,
    host: "localhost",
  },
  mongodb: {
    schema: "mongodb",
    user: "mongo",
    pass: "hzOyAWkWMpUUjcwiCKOdWBYSENCrgwwN",
    host: "hopper.proxy.rlwy.net:47441",
    database: "app_chat",
    options: {
      authSource: "admin",
    },
  },
   redis: {
        user: "default",
        pass: "ojNrMOvcZUsAzBjnUMMHrxNBbaiKutaG",
        host: "trolley.proxy.rlwy.net:59957",
      },
  cloudinary: {
    cloud_name: "dcplqohwd",
    api_key: "945292861993721",
    api_secret: "J_ohAUV8PvwaiqTlha3ho0YZ4u4",
  },
};

const production = {
  app: {
    name: "MyApp",
    version: "1.0.0",
    description: "This is a sample application configuration file.",
    port: 3000,
    host: "localhost",
  },
  mongodb: {
    schema: "mongodb",
    user: "mongo",
    pass: "hzOyAWkWMpUUjcwiCKOdWBYSENCrgwwN",
    host: "hopper.proxy.rlwy.net:47441",
    database: "app_chat",
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
    user: "default",
    pass: "ojNrMOvcZUsAzBjnUMMHrxNBbaiKutaG",
    host: "redis.railway.internal:6379",
  },
};
const config = { production, devlopment };
const env = process.env.NODE_ENV || "devlopment";
console.log("NODE_ENV::: ", env);

export default config[env];
