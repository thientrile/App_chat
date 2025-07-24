/** @format */

"use strict";


import keytokenModel from "../model/key.model.js";


const tkn_findOne = async (filter) => {
  return keytokenModel.findOne(filter).lean();
};
const tkn_deleteOne = async (filter) => {
  return keytokenModel.deleteOne(filter);
};
const tkn_updateOne = async (filter, data) => {
  const option = { new: true, upsert: true };
  return keytokenModel.findOneAndUpdate(filter, data, option).exec();
};
const tkn_checkKeyTokenVerify = async (clientId) => {

  const result = await keytokenModel.aggregate([
    {
      $match: {
        tkn_clientId: clientId,
      },
    },
    {
      $lookup: {
        from: "Users",
        localField: "tkn_userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },

    {
      $project: {
        id:"$usr_id",
        _id: 0,
        tkn_clientId: 1,
        tkn_userId: 1,
        tkn_jit: 1,       
        status: "$user.usr_status",
        info: "$user",
      },
    },

    {
      $match: {
        status: "active",
      },
    },
  ]);
  return result[0];
};
const adddJitToKeyToken = async (clientId, jit) => {
  return keytokenModel.findOneAndUpdate(
    { tkn_clientId: clientId },
    {
      $push: {
        tkn_jit: jit,
      },
    },
    {
      new: true,
    }
  );
}
const updateFcmToken= async (clientId, fcmToken) => {
  return keytokenModel.findOneAndUpdate(
    {
      tkn_clientId: clientId,
    },
    {
      tkn_fcmToken: fcmToken,
    },
    {
      new: true,    
    }
  );  
}
export {
  adddJitToKeyToken,
  updateFcmToken,
  tkn_findOne,
  tkn_deleteOne,
  tkn_updateOne,
  tkn_checkKeyTokenVerify,
};
