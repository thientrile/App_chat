import { initSocketIO } from "../../pkg/socketio/socketio.js";
import { socketAuthMiddleware } from "../../pkg/token/socketIoAuth.js";
import { chatHandler, chatRoomHandler } from "../socket/main.js";


const InitSocketIo=async (http)=>{
    const SocketIOHandles=[chatHandler,chatRoomHandler];
   const SocketMiddleware=[socketAuthMiddleware]
   
   
   
   
   
   
   
    await initSocketIO(http,global.RedisClient,SocketMiddleware,SocketIOHandles);
}
export default InitSocketIo;