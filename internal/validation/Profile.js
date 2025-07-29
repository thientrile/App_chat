import Joi from "joi";

/**
 * Schema for validating friend request input
 * @type {Joi.ObjectSchema}
 */
export const inputSendFriendRequest = Joi.object({
  receiveId: Joi.string().required(),
  message: Joi.string().max(500).required()
});