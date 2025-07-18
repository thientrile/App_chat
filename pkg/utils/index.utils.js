// Utility functions module (ES6 style export)

/** @format */

/** @format */

"use strict";
import { generateKeyPairSync } from "node:crypto";
import _ from "lodash";
import { Types, default as mongoose } from "mongoose";
import Joi from "joi";
/**
 * Retrieves specified fields from an object.
 *
 * @param {Object} options - The options object.
 * @param {Array} options.fields - The fields to retrieve from the object.
 * @param {Object} options.object - The object to retrieve fields from.
 * @returns {Object} - An object containing only the specified fields from the original object.
 */
const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};
/**
 * Omit specified fields from an object.
 *
 * @param {Object} options - The options object.
 * @param {Array} options.fields - The fields to omit from the object.
 * @param {Object} options.object - The object to omit fields from.
 * @returns {Object} - The object with specified fields omitted.
 */
const omitInfoData = ({ fields = [], object = {} }) => {
  return _.omit(object, fields);
};

/**
 * Converts an array of select options into an object with each option as a key and value 1.
 *
 * @param {Array} select - The array of select options.
 * @returns {Object} - The object with select options as keys and value 1.
 */
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};
/**
 * Creates an object with keys from the given array and sets their values to 0.
 *
 * @param {Array} select - The array of keys.
 * @returns {Object} - The object with keys from the array and values set to 0.
 */
const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};
/**
 * Removes properties with null or undefined values from an object.
 *
 * @param {Object} obj - The object to remove properties from.
 * @returns {Object} - The object with null or undefined properties removed.
 */
const removeUndefineObject = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] === null || obj === undefined) {
      delete obj[k];
    }
  });
  return obj;
};
/**
 * Recursively updates a nested object by flattening it.
 *
 * @param {Object} obj - The object to be updated.
 * @returns {Object} - The updated object with flattened properties.
 */
const updateNestedObject = (obj) => {
  const final = {};

  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === "object" && !Array.isArray(obj[k])) {
      const respone = updateNestedObject(obj[k]);
      Object.keys(respone).forEach((a) => {
        final[`${k}.${a}`] = respone[a];
      });
    } else {
      final[k] = obj[k];
    }
  });

  return final;
};
/**
 * Converts a string ID to a Mongoose ObjectId.
 *
 * @param {string} id - The string ID to convert.
 * @returns {ObjectId} The converted Mongoose ObjectId.
 */
const convertToObjectIdMongoose = (id) => new Types.ObjectId(id);
/**
 * Converts a string ID to a Mongoose UUID object.
 *
 * @param {string} id - The string ID to convert.
 * @returns {Types.UUID} - The converted Mongoose UUID object.
 */
const converToUUIDMongoose = (id) => new Types.UUID(id);
/**
 * Converts the input to an array.
 *
 * @param {Array|string} arr - The input to be converted to an array.
 * @returns {Array} - The converted array.
 */




/**
 * Object containing validation methods.
 * @namespace isValidation
 */


/**
 * Adds a prefix to the keys of an object, excluding specified keys.
 *
 * @param {Object} obj - The object to modify.
 * @param {string} prefix - The prefix to add to the keys.
 * @param {Array} excludedKeys - The keys to exclude from prefixing.
 * @returns {Object} - The modified object with prefixed keys.
 */
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

/**
 * Removes a prefix from the keys of an object.
 *
 * @param {Object} obj - The object from which to remove the prefix.
 * @param {string} prefix - The prefix to remove from the keys.
 * @returns {Object} - A new object with the prefix removed from the keys.
 */
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
/**
 * Generates a random ID by combining the current timestamp with a random number.
 * @returns {string} The generated random ID.
 */
const randomId = () => {
  return `${Date.now()}${Math.floor(Math.random() * 999)}`;
};
const createMongoObjectId = () => {
  return new Types.ObjectId();
};
const generatedKey = (length = 2048) => {
  return generateKeyPairSync("rsa", {
    modulusLength: length,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });
};
const JoiValidate = (schema, input) => {
  const { error } = schema.validate(input);
  if (error) {
    next(new BadRequestError(error.details[0].message));
  }
};

export {
  generatedKey,
JoiValidate,
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefineObject,
  updateNestedObject,
  omitInfoData,
  convertToObjectIdMongoose,

  converToUUIDMongoose,
  addPrefixToKeys,
  removePrefixFromKeys,
  randomId,

  createMongoObjectId,
};
