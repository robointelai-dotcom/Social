import { Schema, model } from "mongoose";

const taskSchema = new Schema({
    traceId: { type: String, required: false },
    mobileId: { type: String, required: true },
    taskId: { type: String, required: true },
    status: { type: String, required: true, default: "Pending" },
    scheduledAt: { type: Date, required: true },
}, { timestamps: true });

export const Task = model("task", taskSchema);