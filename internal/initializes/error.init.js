/** @format */

import { errorLogger, systemLogger } from "../../pkg/logger/index.js";

const InitError = (app) => {
  // 404 Not Found handler
  app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
  });
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
    Logger.error(`Error occurred: ${error.message}`, {
      statusCode,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  return res.status(statusCode).json({
    status: 'Error',
    code: statusCode,
    message: error.message || 'Internal Server Error'
  });
});
  // Global error management function with logging
  // app.use(errorLogger);

  // Log error handler initialization
  systemLogger.startup("Error Handler", "Initialized");
};

export default InitError;
