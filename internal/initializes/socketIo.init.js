import { initSocketIO } from "../../pkg/socketio/socketio.js";
import { socketAuthMiddleware, socketDisconnectMiddleware } from "../../pkg/socketio/socketIoAuth.js";
import { chatHandler, chatRoomHandler, handleCall } from "../socket/main.js";


const InitSocketIo=async (http)=>{
    const SocketIOHandles=[chatHandler,chatRoomHandler, handleCall];


   const SocketMiddleware=[socketAuthMiddleware]
   const socketHandlerDisconnect = [
    socketDisconnectMiddleware
   ]
   
   
    
    


    await initSocketIO(http,global.RedisClient,SocketMiddleware,SocketIOHandles,socketHandlerDisconnect);

}
export default InitSocketIo;