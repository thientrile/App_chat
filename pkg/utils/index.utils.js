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
const randomId = (() => {
  let lastMs = 0;
  let seq = 0;
  const MAX_SEQ = 0xFFFFFF; // ~16.7 triệu ID trong 1ms

  const toHex = (n, width) => n.toString(16).padStart(width, "0");

  return function () {
    let now = Date.now();

    // chống đồng hồ hệ thống giật lùi
    if (now < lastMs) now = lastMs;

    if (now === lastMs) {
      // cùng 1 ms -> tăng sequence
      if (++seq > MAX_SEQ) { // quá tải 1ms -> nhảy logic sang ms tiếp theo
        lastMs = lastMs + 1;
        seq = 0;
      }
    } else {
      // ms mới -> reset sequence
      lastMs = now;
      seq = 0;
    }

    // fixed-width -> so sánh theo chuỗi cũng đúng thứ tự
    const timeHex = toHex(lastMs, 12);                 // 48-bit time
    const seqHex = toHex(seq, 6);                     // 24-bit seq
    const randHex = toHex((Math.random() * 0x10000) | 0, 4); // 16-bit random (không ảnh hưởng thứ tự)

    return `${timeHex}${seqHex}${randHex}`;
  };
})();
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
function pairRoomId(a, b) {
  const sa = String(a), sb = String(b);
  return sa < sb ? `${sa}.${sb}` : `${sb}.${sa}`;
}
const escape = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const expiresIn = (day) => {
  return Date.now() + day * 24 * 60 * 60 * 1000;
}
export {
  expiresIn,
  escape,
  pairRoomId,
  addPrefixToKeys,
  removePrefixFromKeys,
  convertToObjectIdMongoose,
  convertToUUIDMongoose,
  randomId,
  isValidation,
  getInfoData,
  omitInfoData
};