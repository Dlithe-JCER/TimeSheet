const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        code: { type: String, trim: true },
        description: { type: String, trim: true },
        active: { type: Boolean, default: true },
        completedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema, "projects");
