const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    taskType: { type: mongoose.Schema.Types.ObjectId, ref: "TaskType", required: true },
    week: { type: mongoose.Schema.Types.ObjectId, ref: "Week", required: true },

    title: { type: String, required: true },
    description: { type: String },
    hours: { type: Number, default: 0 },
    status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },

    // ✅ use Model name here
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "TimesheetUser", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema, "tasks");
