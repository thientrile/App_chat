

import express from 'express';
import { GetMessagesByRoomId, GetRoomChats, SendMessage, MaskAsRead } from '../controller/Message/message.controller.js';
import authertication from '../../pkg/token/auth.js';

const RouterMessage = express.Router();
RouterMessage.use(authertication);
RouterMessage.get("/rooms", GetRoomChats);
RouterMessage.get("/rooms/:id", GetMessagesByRoomId);
RouterMessage.post("/:room_id/send", SendMessage);
RouterMessage.post("/:room_id/maskAsRead", MaskAsRead); 

export default RouterMessage;