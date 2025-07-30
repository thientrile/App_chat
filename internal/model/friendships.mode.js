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
    },
    frp_blocker:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    }
},{
    timestamps: true,
    collection: Collections,
})
friendshipSchema.index(
  { frp_userId1: 1, frp_userId2: 1 },
  { unique: true }
);
export default model(Documents, friendshipSchema);