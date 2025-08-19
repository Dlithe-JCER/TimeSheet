const mongoose = require("mongoose");

const weeklyLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    taskTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "TaskType", required: true },
    weekNumber: { type: Number, required: true },
    isoYear: { type: Number, required: true },
    days: {
        mon: { type: Number, default: 0 },
        tue: { type: Number, default: 0 },
        wed: { type: Number, default: 0 },
        thu: { type: Number, default: 0 },
        fri: { type: Number, default: 0 },
        sat: { type: Number, default: 0 },
        sun: { type: Number, default: 0 },
    },
}, { timestamps: true });

module.exports = mongoose.model("WeeklyLog", weeklyLogSchema);
