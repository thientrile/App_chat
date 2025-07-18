
import Joi from 'joi';

const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  age: Joi.number().integer().min(0).max(120),
  email: Joi.string().email().required(),
});



export {
    schema
}
