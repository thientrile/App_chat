import { dbLogger } from "../logger/utils.js";
import mongoose from "mongoose";

const connect = (mongoUrl, option = {}) => {
  mongoose
    .connect(mongoUrl, option)
    .then(() => {
      dbLogger.connect("MongoDB", "MongoDB connected successfully ✅");
      clearTimeout(connect.errorTimeout);
    })
    .catch((err) => {
      dbLogger.error("MongoDB", "MongoDB connection error ❌", {
        message: err.message,
        stack: err.stack,
      });
      console.log("Retrying connection in 5 seconds...");
      connect.errorTimeout = setTimeout(connect, 5000);
    });
};

const mongoConnets = (mongoUrl, option = {}) => {
  return mongoose.createConnection(mongoUrl, option);

};
export const mongoConnet = connect;
export const mongoConnetCreate = mongoConnets;