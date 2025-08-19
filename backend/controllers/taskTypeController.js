const TaskType = require("../models/TaskType");

// Create a task type
exports.createTaskType = async (req, res) => {
    try {
        const taskType = await TaskType.create(req.body);
        res.status(201).json(taskType);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all task types
exports.getTaskTypes = async (req, res) => {
    try {
        const taskTypes = await TaskType.find();
        res.status(200).json(taskTypes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
