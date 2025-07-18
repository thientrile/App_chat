import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import express from "express";
import { requestLogger } from "@logger/utils";

const InitMiddle = (app) => {
  app.use(cors());
  app.use(morgan("combined"));
  app.use(helmet());
  app.use(compression());
  app.use(express.json()); // for parsing application/json
  app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  app.use(requestLogger);
};

export default InitMiddle;
