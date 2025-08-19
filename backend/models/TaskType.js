const mongoose = require("mongoose");

const taskTypeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model("TaskType", taskTypeSchema, "tasktypes");
