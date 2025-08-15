


import e from 'express';
import authertication from '../../../pkg/token/auth.js';
import { asyncHandler } from '../../../pkg/async/asyncHandler.js';
import { GetRoomChats } from '../../controller/Message/message.controller.js';

const MessageRouter = e.Router();

MessageRouter.use(authertication)
MessageRouter.get("/rooms",asyncHandler(GetRoomChats))

export default MessageRouter;