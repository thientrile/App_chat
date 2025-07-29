import { convertToObjectIdMongoose, isValidation } from "../../pkg/utils/index.utils.js";
import userModel from "../model/user.model.js";




export const checkUserExistByUserId = async (UserId) => {
	return userModel.findById(convertToObjectIdMongoose(UserId)).lean();
};
export const userDeleteByUserId = async (UserId) => {
	return userModel.deleteOne({ _id: convertToObjectIdMongoose(UserId) });
};
export const userFindByusername = async (username) => {
	let filter;
	if (isValidation.isEmail(username)) {
		filter = { usr_email: username };
	} else if (isValidation.isPhoneNumber(username)) {
		filter = { usr_phone: username };
	} else {
		filter = { usr_slug: username };
	}

	return userModel.findOne(filter).lean();
};

export const userFindById = async (Id) => {
	return userModel.findOne({ usr_id: Id }).lean();
}

