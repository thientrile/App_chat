import { Types } from "mongoose";

import _ from "lodash";

/**
 * Chỉ lấy các field được chỉ định từ object
 * @param {Object} options
 * @param {Array} options.fields - Danh sách field cần lấy
 * @param {Object} options.object - Object nguồn
 * @returns {Object}
 */
 const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

/**
 * Bỏ qua các field được chỉ định từ object
 * @param {Object} options
 * @param {Array} options.fields - Danh sách field cần loại
 * @param {Object} options.object - Object nguồn
 * @returns {Object}
 */
 const omitInfoData = ({ fields = [], object = {} }) => {
  return _.omit(object, fields);
};
const convertToObjectIdMongoose = (id) => new Types.ObjectId(id);
const convertToUUIDMongoose = (id) => new Types.UUID(id);
const randomId = () => {
  return `${Date.now()}${Math.floor(Math.random() * 999)}`;
};
const isValidation = {
  /**
   * Checks if the input is a valid email address.
   * @memberof isValidation
   * @param {string} input - The input to be validated.
   * @returns {boolean} - Returns true if the input is a valid email address, otherwise false.
   */
  isEmail: (input) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(input);
  },
  /**
   * Checks if the input is a valid phone number.
   * @memberof isValidation
   * @param {string} input - The input to be validated.
   * @returns {boolean} - Returns true if the input is a valid phone number, otherwise false.
   */
  isPhoneNumber: (input) => {
    var phonePattern =
      /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phonePattern.test(input);
  },
  /**
   * Checks if the input is a valid username.
   * @memberof isValidation
   * @param {string} input - The input to be validated.
   * @returns {boolean} - Returns true if the input is a valid username, otherwise false.
   */
  isUserName: (input) => {
    var usernamePattern = /^\w{4,16}$/;
    return usernamePattern.test(input);
  },
};

function addPrefixToKeys(obj, prefix, excludedKeys = []) {
  const newObj = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Kiểm tra xem key có nằm trong danh sách excludedKeys không
      if (excludedKeys.includes(key)) {
        newObj[key] = obj[key]; // Giữ nguyên key nếu có trong danh sách loại trừ
      } else {
        newObj[prefix + key] = obj[key]; // Thêm tiền tố nếu không có trong danh sách loại trừ
      }
    }
  }
  return newObj;
}
const removePrefixFromKeys = (obj, prefix) => {
  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && key.startsWith(prefix)) {
      newObj[key.slice(prefix.length)] = obj[key];
    } else {
      newObj[key] = obj[key]; // Giữ nguyên các key không có tiền tố
    }
  }
  return newObj;
};

export {
  addPrefixToKeys,
  removePrefixFromKeys,
  convertToObjectIdMongoose,
  convertToUUIDMongoose,
  randomId,
  isValidation,
  getInfoData,
  omitInfoData
};