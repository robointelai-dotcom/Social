import { Schema, model } from "mongoose";

const postSchema = new Schema({
    taskId: { type: String, required: false },
    username: { type: String, required: true },
    platform: { type: String, required: true },
    scheduleAt: { type: Date, required: true },
    status: { type: String, default: "Scheduled" },
    caption: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, required: true },
}, { timestamps: true });

export const Post = model("scheduledPost", postSchema);