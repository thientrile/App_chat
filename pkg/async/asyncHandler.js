import { serializeError } from "../response/error.js";

const asyncHandler = (fn) => {
  return (req, res, next) => {

    fn(req, res, next).catch(next);
  };
};
// socket/socketAsync.js
// socket/socketAsync.js


export {
  asyncHandler,
};