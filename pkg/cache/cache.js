



const keyRedisLogout = (userId, jit) => {
  return `logout:${userId}:${jit}`;
};

export{
    keyRedisLogout
}