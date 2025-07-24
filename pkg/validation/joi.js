import { BadRequestError } from "../response/error.js";

const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      next(new BadRequestError(error.details[0].message));
    }
    next();
  };
};
export default validateSchema;