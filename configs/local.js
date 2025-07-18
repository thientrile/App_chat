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
    pass: "JbRhebwthEmdazawqbuhHoJPZujyzIMq",
    host: "ballast.proxy.rlwy.net:15545",
    database: "AppChat",
    options: {
      authSource: "admin",
    },
  },
   redis: {
        user: "default",
        pass: "dKEsVLHmGmAWnyDlNoyMnYBtPDJhTfos",
        host: "trolley.proxy.rlwy.net:31429",
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
    pass: "JbRhebwthEmdazawqbuhHoJPZujyzIMq",
    host: "mongodb.railway.internal:27017",
    database: "AppChat",
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
    pass: "dKEsVLHmGmAWnyDlNoyMnYBtPDJhTfos",
    host: "redis.railway.internal:6379",
  },
};
const config = { production, devlopment };
const env = process.env.NODE_ENV || "devlopment";
console.log("NODE_ENV::: ", env);

export default config[env];
