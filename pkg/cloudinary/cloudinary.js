'use strict'

const { Config } = require('../../src/app');



const cloudinary= require('cloudinary').v2;


cloudinary.config(Config.cloudinary);
module.exports = cloudinary;