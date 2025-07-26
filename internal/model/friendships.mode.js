import {
    model,
    Schema
} from 'mongoose';
const Documents = "Friendship";
const Collections = "Friendships";
const friendshipSchema = new Schema({
    frp_userId1:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    frp_userId2:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    frp_status:{
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'blocked'],
        default: 'pending',
    }
},{
    timestamps: true,
    collection: Collections,
})
export default model(Documents, friendshipSchema);