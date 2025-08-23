

import express from 'express';
import validateSchema from '../../../pkg/validation/joi.js';
import { inputLogin, inputRegister, inputSetFcmToken } from '../../validation/Account.js';
import authertication from '../../../pkg/token/auth.js';
import { LoginAccount, LogoutAccount, RefreshToken, RegisterAccount,  SetFirebaseToken, UpdateAccount } from '../../controller/Account/account.controller.js';
import { asyncHandler } from '../../../pkg/async/asyncHandler.js';
const AccoutRouter=express.Router();

AccoutRouter.post('/register',validateSchema(inputRegister), asyncHandler(RegisterAccount));
AccoutRouter.post('/login', validateSchema(inputLogin), asyncHandler(LoginAccount));
AccoutRouter.use(authertication)
AccoutRouter.patch('/refresh-token', asyncHandler(RefreshToken));
AccoutRouter.delete('/logout', asyncHandler(LogoutAccount));
AccoutRouter.patch('/set-fcm-token', validateSchema(inputSetFcmToken), asyncHandler(SetFirebaseToken));

export default AccoutRouter;