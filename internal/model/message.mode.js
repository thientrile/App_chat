import { Schema, model } from 'mongoose';
import { randomId } from '../../pkg/utils/index.utils.js';
const Documents = "Message";
const Collections = "Messages";

const messageSchema = new Schema({
    msg_id: {
        type: String,
        default: () => randomId()
    },
    msg_content: {
        type: String,
        required: true,
    },
    msg_sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    msg_room: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    msg_type: {
        type: String,
        enum: ['text', 'image', 'video', 'file'],
        default: 'text',
    },
    msg_deleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    collection: Collections,
})
messageSchema.index({ msg_room: 1, msg_sender: 1 });
export default model(Documents, messageSchema);