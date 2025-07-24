import { SuccessReponse } from "../../pkg/response/success.js";



const healthCheck= async (req, res) => {
     new SuccessReponse({
        message: "Health check successful",
        metadata:{
            status: "OK",
            timestamp: new Date().toISOString(),
        } ,
      }).send(res);
}

export { healthCheck };