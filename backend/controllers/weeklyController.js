const WeeklyLog = require("../models/WeeklyLog");
const TimesheetUser = require("../models/timeSheetUsers");
const Project = require("../models/Project");

const getCurrentIsoWeek = () => {
    const date = new Date();
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return { weekNumber: weekNo, isoYear: d.getUTCFullYear() };
};

// Save / update weekly log
exports.upsertWeeklyLog = async (req, res) => {
    try {
        const { userId, projectId, taskTypeId, weekNumber, isoYear, days } = req.body;

        const user = await TimesheetUser.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const current = getCurrentIsoWeek();
        if (current.weekNumber !== weekNumber || current.isoYear !== isoYear) {
            return res.status(423).json({ message: "This week is locked (read-only)" });
        }

        const project = await Project.findById(projectId);
        if (!project || !project.active) {
            return res.status(400).json({ message: "Project not active" });
        }

        const log = await WeeklyLog.findOneAndUpdate(
            { userId, projectId, taskTypeId, weekNumber, isoYear },
            {
                $set: {
                    employeeId: user.employeeId,
                    employeeName: user.name,
                    days
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await log.save();
        res.status(201).json(log);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get logs for a week
exports.getWeekLogs = async (req, res) => {
    try {
        const { userId, weekNumber, isoYear } = req.query;

        const logs = await WeeklyLog.find({ userId, weekNumber, isoYear })
            .populate("projectId", "name")
            .populate("taskTypeId", "name");

        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
