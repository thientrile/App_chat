/** @format */

"use strict";
import { StatusCodes, ReasonPhrases } from"./HttpStatusCode/index.js";

class SuccessReponse {
  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    metadata = {},
  }) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;

    this.metadata = metadata;
  }

  send(res,  headers = {}) {
     
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(this.status).json(this);
  }
}

class OK extends SuccessReponse {
  constructor({ message, metadata }) {
    super({ message, metadata });
  }
}
class CREATED extends SuccessReponse {
  constructor({
    options = {},
    message,
    statusCode = StatusCodes.CREATED,
    reasonStatusCode = ReasonPhrases.CREATED,
    metadata,
  }) {
    super({ message, statusCode, reasonStatusCode, metadata });
    this.options = options;
  }
}
// class SuccessReponse extends suc
export  {
  OK,
  CREATED,
  SuccessReponse,
};
