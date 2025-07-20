import {Schema, model} from 'mongoose';
const Documents="User"
const Collections="Users";
const userSchema = new Schema({
    usr_username:{
        type: String,
        required: true,
    },
    usr_fullname:{
        type: String,
        required: true,
    },
    usr_email:{
        type: String,
        // required: true,
        unique: true,
    },
    usr_salt:{
        type: String,
        required: true,
    },
    usr_avatar:{
        type: String,   
        default: "https://example.com/default-avatar.png",
    },
    usr_dateOfBirth:{
        type: Date,
        default: Date.now,  
    },
    usr_gender:{
        type: String,
        default: "Not Specified",
    },
    usr_stauts:{
        type: String,
        unique: true,
        enum:['active', 'inactive', 'banned'],
    },       
},{
    timestamps: true,    collection: Collections,
})
export default model(Documents, userSchema);