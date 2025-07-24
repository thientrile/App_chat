import { requestLogger } from "../../pkg/logger/utils.js";
import Router from "../router/index.js";




const InitRouter= (app) => {
  app.use(requestLogger);
   app.use("/api", Router); 
}

export default InitRouter;