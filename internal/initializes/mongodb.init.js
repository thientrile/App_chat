/** @format */
'use strict';

import {Config} from '../../global.js';
import { mongoConnet } from '../../pkg/mongodb/mongodb.js';
// Access global Config that was loaded in index.js
const { schema, user, pass, host, database, options } = Config.mongodb;

function getMongoUrl() {
	const encodedUser = encodeURIComponent(user);
	const encodedPass = encodeURIComponent(pass);
	if (!user || !pass) {
    return `${schema}://${host}/${database}`;
  }
	return `${schema}://${encodedUser}:${encodedPass}@${host}/${database}`;
}

function InitMongoDB() {
	const mongoUrl = getMongoUrl();
	
  mongoConnet(mongoUrl, options);
}

export default InitMongoDB;
