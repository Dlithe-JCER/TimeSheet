const WeeklyLog = require("../models/WeeklyLog");
const TimesheetUser = require("../models/timeSheetUsers");

// Helper function to get week number
function getWeekNumber(date) {
    const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    return Math.ceil(((temp - yearStart) / 86400000 + 1) / 7);
}

// Create weekly log
exports.createWeeklyLog = async (req, res) => {
    try {
        const { userId, projectId, taskTypeId, weekNumber, isoYear, days, status } = req.body;

        // Validate required fields
        if (!userId || !projectId || !taskTypeId || !weekNumber || !isoYear) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Ensure user exists
        const user = await TimesheetUser.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const weeklyLog = new WeeklyLog({
            userId,
            projectId,
            taskTypeId,
            weekNumber,
            isoYear,
            days: days || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
            status: status || "todo"
        });

        await weeklyLog.save();
        res.status(201).json({ message: "Weekly log saved", weeklyLog });
    } catch (err) {
        console.error("Error creating weekly log:", err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "A log already exists for this user, project, task type, week, and year" });
        }
        res.status(500).json({ message: err.message });
    }
};

// Create or update weekly log (UPSERT)
exports.upsertWeeklyLog = async (req, res) => {
    try {
        const { userId, projectId, taskTypeId, weekNumber, isoYear, days, status } = req.body;

        // Validate required fields
        if (!userId || !projectId || !taskTypeId || !weekNumber || !isoYear) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Ensure user exists
        const user = await TimesheetUser.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prepare update data
        const updateData = {
            userId,
            projectId,
            taskTypeId,
            weekNumber,
            isoYear,
            status: status || "todo",
            days: days || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
        };

        // Find and update or create - ensures ONE record per user per project per task type per week per year
        const log = await WeeklyLog.findOneAndUpdate(
            {
                userId,
                projectId,
                taskTypeId,
                weekNumber,
                isoYear
            },
            updateData,
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        res.json({
            message: "Weekly log upserted successfully",
            log
        });
    } catch (err) {
        console.error("Error upserting weekly log:", err);
        res.status(500).json({ message: err.message });
    }
};

// Bulk upsert for multiple tasks
exports.upsertWeeklyLogsBulk = async (req, res) => {
    try {
        const { tasks } = req.body;

        if (!tasks || !Array.isArray(tasks)) {
            return res.status(400).json({ message: "Tasks array is required" });
        }

        const results = [];
        const bulkOperations = [];

        for (const taskData of tasks) {
            const { userId, projectId, taskTypeId, weekNumber, isoYear, days, status } = taskData;

            // Validate required fields
            if (!userId || !projectId || !taskTypeId || !weekNumber || !isoYear) {
                results.push({ error: "Missing required fields", task: taskData });
                continue;
            }

            // Ensure user exists
            const user = await TimesheetUser.findById(userId);
            if (!user) {
                results.push({ error: "User not found", task: taskData });
                continue;
            }

            const updateData = {
                userId,
                projectId,
                taskTypeId,
                weekNumber,
                isoYear,
                status: status || "todo",
                days: days || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
            };

            bulkOperations.push({
                updateOne: {
                    filter: { userId, projectId, taskTypeId, weekNumber, isoYear },
                    update: updateData,
                    upsert: true
                }
            });
        }

        if (bulkOperations.length > 0) {
            await WeeklyLog.bulkWrite(bulkOperations);

            // Fetch the updated logs to return
            const updatedLogs = await WeeklyLog.find({
                $or: tasks.map(task => ({
                    userId: task.userId,
                    projectId: task.projectId,
                    taskTypeId: task.taskTypeId,
                    weekNumber: task.weekNumber,
                    isoYear: task.isoYear
                }))
            }).populate("projectId", "name").populate("taskTypeId", "name");

            results.push(...updatedLogs.map(log => ({ success: true, log })));
        }

        res.json({ message: "Bulk upsert completed", results });
    } catch (err) {
        console.error("Error in bulk upsert:", err);
        res.status(500).json({ message: err.message });
    }
};

// Get logs for a specific user and week
exports.getWeeklyLogs = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isoYear, weekNumber } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const filter = { userId };
        if (isoYear) filter.isoYear = parseInt(isoYear);
        if (weekNumber) filter.weekNumber = parseInt(weekNumber);

        const logs = await WeeklyLog.find(filter)
            .populate("projectId", "name")
            .populate("taskTypeId", "name")
            .populate("userId", "name email employeeId");

        res.json(logs);
    } catch (err) {
        console.error("Error getting weekly logs:", err);
        res.status(500).json({ message: err.message });
    }
};

// Get logs for current week
exports.getCurrentWeekLogs = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const today = new Date();
        const weekNumber = getWeekNumber(today);
        const isoYear = today.getFullYear();

        const logs = await WeeklyLog.find({
            userId,
            weekNumber,
            isoYear
        })
            .populate("projectId", "name")
            .populate("taskTypeId", "name");

        res.json(logs);
    } catch (err) {
        console.error("Error getting current week logs:", err);
        res.status(500).json({ message: err.message });
    }
};

// Delete a weekly log
exports.deleteWeeklyLog = async (req, res) => {
    try {
        const { id } = req.params;

        const log = await WeeklyLog.findByIdAndDelete(id);
        if (!log) {
            return res.status(404).json({ message: "Weekly log not found" });
        }

        res.json({ message: "Weekly log deleted successfully" });
    } catch (err) {
        console.error("Error deleting weekly log:", err);
        res.status(500).json({ message: err.message });
    }
};
// Get ALL logs (admin view)
// Get ALL logs (admin view)
exports.getAllWeeklyLogs = async (req, res) => {
    try {
        const { isoYear, weekNumber } = req.query;
        const filter = {};

        if (isoYear) filter.isoYear = parseInt(isoYear);
        if (weekNumber) filter.weekNumber = parseInt(weekNumber);

        const logs = await WeeklyLog.find(filter)
            .populate("projectId", "name")
            .populate("taskTypeId", "name")
            .populate("userId", "name email employeeId");

        res.json(logs);
    } catch (err) {
        console.error("Error getting all weekly logs:", err);
        res.status(500).json({ message: err.message });
    }
};
