import { randomUUID } from 'crypto';
import {
    model,
    Schema
} from 'mongoose';
import { v4 as uuidv4 } from "uuid";
const Documents = "Key";
const Collections = "Keys";

const tknSchema = new Schema({
    tkn_userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tkn_clientId: {
        type: String, // ← fix chỗ này
        default: () => randomUUID(),
        unique: true,
        index: true,
    },
    tkn_fcmToken: {
        type: String,
        // unique: true,
        default: null,
    },
    tkn_jit: {
        type: Array,
        default: [],
    }

}, {
    timestamps: true,
    collection: Collections,
})


export default model(Documents, tknSchema);