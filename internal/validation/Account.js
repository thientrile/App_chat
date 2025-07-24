
import Joi from 'joi';

const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  age: Joi.number().integer().min(0).max(120),
  email: Joi.string().email().required(),
});



const inputRegister = Joi.object({
  username: Joi.alternatives().try(
    Joi.string().email(),
    Joi.string().pattern(/^[0-9]{9,15}$/), // Số điện thoại (VN thường 10 số)
  ).required(),
  password: Joi.string().min(6).max(30).required(),
  fullname: Joi.string().min(3).max(50).required(),

})
const inputLogin = Joi.object({
  username: Joi.alternatives().try(
    Joi.string().email(),
    Joi.string().pattern(/^[0-9]{9,15}$/), // Số điện thoại (VN thường 10 số)
    Joi.string().pattern(/^[a-zA-Z0-9_]{3,30}$/) // Username
  ).required(),
  password: Joi.string().required(),
});
const inputSetFcmToken = Joi.object({
  token: Joi.string().required(),
}).required();
export {
  inputSetFcmToken,
  schema,
  inputRegister,
  inputLogin
}
