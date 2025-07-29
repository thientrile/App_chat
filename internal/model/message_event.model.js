import {
    model,
    Schema
}
from 'mongoose';
const Documents = "MessageEvent";
const Collections = "MessageEvents";
const messageEventSchema = new Schema({
    event_type:{
        type: String,
        enum: ['readed','del_only','del_all'],
        required: true,
        default: 'readed',
    },
    event_senderId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    event_msgId:{
        type: Schema.Types.ObjectId,
        ref: 'Message',
        required: true,
    },
    event_roomId:{
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
}, {
    timestamps: true,
    collection: Collections,
});
messageEventSchema.index({ event_msgId: 1, event_senderId: 1 });
export default model(Documents, messageEventSchema);
