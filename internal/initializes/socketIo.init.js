import { initSocketIO } from "../../pkg/socketio/socketio.js";


const InitSocketIo=async (http)=>{
    await initSocketIO(http,global.RedisClient);
}
export default InitSocketIo;