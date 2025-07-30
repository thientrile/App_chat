import { Schema, model } from "mongoose";
const Documents = "Room";
const Collections = "Rooms";
const roomSchema = new Schema({
    room_id: {
        type: String,
        required: true,
        unique: true,
    },
    room_name: {
        type: String,
        default: "Default Room",
    },
    room_type: {
        type: String,
        enum: ['group', 'private'],
    },
    room_members: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            role: {
                type: String,
                enum: ['admin', 'member'],
                default: 'member',
            }
        }
    ],
    room_last_messages:{
        type: Schema.Types.ObjectId,
        ref: 'Message',
    }

}, {
    timestamps: true,
    collection: Collections,
});
roomSchema.index({ room_name: 1,'room_members.userId': 1 });
export default model(Documents, roomSchema);