/** @format */

'use strict';
const multer = require('multer');
const updloadMemory = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024 // no larger than 5mb
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('image')) {
			cb(null, true);
		} else {
			cb(new Error('Not an image! Please upload an image.', 400), false);
		}
	}
});
const uploadDisk = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, 'uploads');
		},
		filename: (req, file, cb) => {
			cb(null, `${Date.now()}-${file.originalname}`);
		}
	})
});
module.exports = { updloadMemory, uploadDisk };
