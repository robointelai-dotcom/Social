import { Schema, model } from "mongoose";

const accountSchema = new Schema({
    mobileId: { type: String, reuired: true },
    platform: { type: String, required: true },
    username: { type: String, index: true, required: true },
    password: { type: String, required: true },
}, { timestamps: true });

export const Account = model("account", accountSchema);