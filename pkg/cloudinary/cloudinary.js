// ESM version of Cloudinary config
import { v2 as cloudinary } from 'cloudinary';
import config from '../../configs.js';

// Configure using values from configs.js
cloudinary.config({
	cloud_name: config.cloudinary.cloud_name,
	api_key: config.cloudinary.api_key,
	api_secret: config.cloudinary.api_secret,
});

export default cloudinary;