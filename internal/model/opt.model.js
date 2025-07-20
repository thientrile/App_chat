import { Schema,model } from "mongoose";
const Documents = "Opt";
const Collections = "Opts";
const optSchema = new Schema({
    opt_phone: {
        type: String,
        required: true,
    },
    otp_key:{
        type: String,
        required: true,
    },
    opt_expiry: {
        type: Date,
        required: true,
    },

},{
    timestamps: true,
    collection: Collections,
})
optSchema.index({ opt_phone: 1}, { unique: true });

export default model(Documents, optSchema);