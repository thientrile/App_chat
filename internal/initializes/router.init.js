import { Router } from "@internal/router/index.js";



const InitRouter= (app) => {
    app.use("", Router);   
}

export default InitRouter;