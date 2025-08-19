const WeeklyLog = require("../models/WeeklyLog");
const TimesheetUser = require("../models/timeSheetUsers");

exports.createWeeklyLog = async (req, res) => {
    try {
        const { projectId, taskTypeId, weekNumber, isoYear, days } = req.body;

        const weeklyLog = new WeeklyLog({
            userId: req.user._id,
            projectId,
            taskTypeId,
            weekNumber,
            isoYear,
            days,
        });

        await weeklyLog.save();
        res.status(201).json({ message: "Weekly log saved", weeklyLog });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.upsertWeeklyLog = async (req, res) => {
    try {
        const { userId, projectId, taskTypeId, weekNumber, isoYear, days } = req.body;

        // 🔎 Fetch employee details
        const user = await TimesheetUser.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prepare log data
        const logData = {
            userId,
            employeeId: user.employeeId,   // pulled from TimesheetUser
            employeeName: user.name,       // pulled from TimesheetUser
            projectId,
            taskTypeId,
            weekNumber,
            isoYear,
            days
        };

        // Create or update weekly log
        const log = await WeeklyLog.findOneAndUpdate(
            { userId, projectId, weekNumber, isoYear },
            logData,
            { new: true, upsert: true, runValidators: true }
        );

        res.json(log);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getWeeklyLogs = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isoYear, weekNumber } = req.query;

        const filter = { userId };
        if (isoYear) filter.isoYear = isoYear;
        if (weekNumber) filter.weekNumber = weekNumber;

        const logs = await WeeklyLog.find(filter)
            .populate("projectId", "name")
            .populate("taskTypeId", "name");

        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
