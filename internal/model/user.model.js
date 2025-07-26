import { Schema, model } from 'mongoose';
import { randomId } from '../../pkg/utils/index.utils.js';
const Documents = "User"
const Collections = "Users";
const userSchema = new Schema({
    usr_id: {
        type: Number,
        default: () => randomId()
    }, //user
    usr_slug: {
        type: String, unique: true,
        required: true,
        default: () => `usr_${randomId()}`
    },
    usr_fullname: {
        type: String,
        required: true,
    },
    usr_email: {
        type: String,
        // required: true,
        unique: true,
    },
    usr_phone: {
        type: String,
        unique: [true, 'Phone number already exists'],
        // sparse: true
    },
    usr_salt: {
        type: String,
        required: true,
    },
    usr_avatar: {
        type: String,
        default: "https://example.com/default-avatar.png",
    },
    usr_dateOfBirth: {
        type: Date,
        default: Date.now,
    },
    usr_gender: {
        type: String,
        default: "Not Specified",
    },
    usr_status: {
        type: String,
        default: "active",
        enum: ['active', 'inactive', 'banned'],
    },

}, {
    timestamps: true, collection: Collections,
})
export default model(Documents, userSchema);