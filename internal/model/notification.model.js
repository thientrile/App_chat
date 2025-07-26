import { Schema, model } from 'mongoose';

const Documents = "Notification";
const Collections = "Notifications";

const notificationSchema = new Schema({
    notif_user_receive: { 
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    notif_user_sender: { 
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    notif_message: { 
        type: String, 
        required: true
    },
    notif_type: {
        type: String, 
        enum: ["friend_request", "message"], 
        required: true
    },
    notif_status: { 
        type: String, 
        enum: ["accepted", "rejected", "waiting", "read", "unread"], 
        default: "waiting" 
    },
}, {
    timestamps: true,
    collection: Collections,
});

notificationSchema.index({ notif_user_receive: 1, notif_user_sender: 1, notif_type: 1 });

export default model(Documents, notificationSchema);
