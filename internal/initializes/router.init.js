import Router from "../router/index.js";




const InitRouter= (app) => {

   app.use("/api", Router); 
}

export default InitRouter;