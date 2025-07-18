/** @format */

"use strict";

import { StatusCodes, ReasonPhrases } from "./HttpStatusCode/index.js";

/**
 * Represents an error response.
 * @class ErrorResponse
 * @extends Error
 */
class ErrorResponse extends Error {
  constructor(message, status) {
    super(`Error: ${message}`);
    this.status = status;
  }
}

/**
 * Represents an error response for a conflict request.
 * @extends ErrorResponse
 */
class ConflictRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.CONFLICT,
    statusCode = StatusCodes.CONFLICT
  ) {
    super(message, statusCode);
  }
}

/**
 * Represents a BadRequestError, which is an ErrorResponse with a status code of 400.
 * @extends ErrorResponse
 */
class BadRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.BAD_REQUEST,
    statusCode = StatusCodes.BAD_REQUEST
  ) {
    super(message, statusCode);
  }
}
/**
 * Represents an authentication failure error.
 * @extends ErrorResponse
 */
class AuthFailureError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.UNAUTHORIZED,
    statusCode = StatusCodes.UNAUTHORIZED
  ) {
    super(message, statusCode);
  }
}

/**
 * Represents a custom error class for Not Found errors.
 * @extends ErrorResponse
 */
class NotFoundError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.NOT_FOUND,
    statusCode = StatusCodes.NOT_FOUND
  ) {
    super(message, statusCode);
  }
}
/**
 * Represents a Forbidden Error.
 * @class
 * @extends ErrorResponse
 */
class ForbiddenError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.FORBIDDEN,
    statusCode = StatusCodes.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}
/**
 * Represents a Not Acceptable Error.
 * @extends ErrorResponse
 */
class NotAcceptableError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.NOT_ACCEPTABLE,
    statusCode = StatusCodes.NOT_ACCEPTABLE
  ) {
    super(message, statusCode);
  }
}
/**
 * Represents an error response for a request timeout.
 * @extends ErrorResponse
 */
class RequestTimeoutErro extends ErrorResponse {
  constructor(
    message = ReasonPhrases.REQUEST_TIMEOUT,
    statusCode = StatusCodes.REQUEST_TIMEOUT
  ) {
    super(message, statusCode);
  }
}
/**
 * Represents a Redis error response.
 * @extends ErrorResponse
 */
class RedisErrorRespoint extends ErrorResponse {
  constructor(
    message = ReasonPhrases.INTERNAL_SERVER_ERROR,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  ) {
    super(message, statusCode);
  }
}

export {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError,
  NotAcceptableError,
  RequestTimeoutErro,
  RedisErrorRespoint
};
