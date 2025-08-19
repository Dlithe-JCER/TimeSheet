// Create Task
const Task = require("../models/Task");
const { getCurrentWeek } = require("../utils/weekUtils");

exports.createTask = async (req, res) => {
    try {
        let { project, taskType, title, description, hours, status, assignedTo } = req.body;

        // Auto fetch or create current week
        const week = await getCurrentWeek();

        const task = await Task.create({
            project,
            taskType,
            week: week._id,   // ✅ auto assigned
            title,
            description,
            hours,
            status,
            assignedTo
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get all tasks
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate("project", "name code")
            .populate("taskType", "name")
            .populate("week", "weekNumber startDate endDate")
            .populate("assignedTo", "name email");

        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
