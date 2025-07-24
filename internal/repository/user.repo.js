import { isValidation } from "../../pkg/utils/index.utils.js";
import userModel from "../model/user.model.js";




const checkUserExistById = async (id) => {
	return userModel.findById(id).lean();
};
const userDeleteById = async (id) => {
	return userModel.deleteOne({ _id: id });
};
const userFindByusername = async (username) => {
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

export {
	checkUserExistById,
	userDeleteById,
	userFindByusername,

};
