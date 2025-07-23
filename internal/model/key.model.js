import {
    model,
    Schema
}
from 'mongoose';
const Documents = "Key";
const Collections = "Keys";

const keySchema = new Schema({
    key_userId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    key_clientId:{
        type: String,
        required: true,
    },
    key_fcmToken:{
        type: String,
        unique: true,
        sparse: true, // Cho phép giá trị null hoặc không có
    },
    key_jit:{
        type:Array,       
        default: [],
    },
    key_userAgent:{
        type:Array,
        default: [],
    }
},{
    timestamps: true,
    collection: Collections,
})

keySchema.index({ key_userId: 1 }, { unique: true });

export default model(Documents, keySchema);