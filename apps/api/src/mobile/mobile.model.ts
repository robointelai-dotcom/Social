import { Schema, model } from "mongoose";

const mobileSchema = new Schema({
    mobileId: { type: String, required: true },
    serialName: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    osVersion: { type: String, required: true },
});

export const Mobile = model("mobile", mobileSchema);