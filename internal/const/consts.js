export const Consts = {
  Retry: 3,
  REDIS_CONNECT_TIMEOUT: 100000,
  REDIS_CONNECT_MESSAGE: {
    code: -99,
    message: {
      vn: "Kết nối tới Redis thất bại",
      en: "Connect to Redis failed",
    },
  },
  ONLINE_USERS_KEY: "list:online_users"
};