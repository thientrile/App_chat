import { Logger } from "../../global.js";
import { Consts } from "../../internal/const/consts.js";
import { sAdd, sCard, sRem } from "../redis/utils.js";




export const keyRedisLogout = (userId) => {
  return `logout::${userId}`;
};

export const KeyRedisGroup = (groupId) => {
  return `group::${groupId}::members`;
};
export const KeyRedisRoom = (userId) => {
  return `room::${userId}`;
};
export const KeyRedisFriend = (userId) => {
  return `list::${userId}::friends`;
};
export const KeyOnlineSocket = (userId) => {
  return `${Consts.ONLINE_SOCKET_KEY}:${userId}`
}
export const KeyOnlineUsers = () => {
  return Consts.ONLINE_USERS_KEY
}
// redis socket
// when user online
export const userOnline = async (userId, socketId) => {
  Logger.info(`User ${userId} is online with socket ${socketId}`);
  await sAdd(KeyOnlineUsers(), userId);
  await sAdd(KeyOnlineSocket(userId), socketId);
};

/**
 * When user offline
 */
export const userOffline = async (userId, socketId) => {
  Logger.info(`User ${userId} is offline from socket ${socketId}`);
  await sRem(`${Consts.ONLINE_SOCKET_KEY}:${userId}`, socketId);
  const remaining = await sCard(`${Consts.ONLINE_SOCKET_KEY}:${userId}`);
  Logger.info(`User ${userId} has ${remaining} sockets online.`);
  if (remaining === 0) {
    await sRem(Consts.ONLINE_USERS_KEY, userId);
  }
};


export const checkOnlineUser = async (userId) => {
  const isOnline = await sIsMember(Consts.ONLINE_USERS_KEY, userId);
  return isOnline;
}