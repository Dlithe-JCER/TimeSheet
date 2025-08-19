const Week = require("../models/Week");

/**
 * Get or create the current week automatically
 */
async function getCurrentWeek() {
    const today = new Date();

    // ISO week start (Monday)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() + 1); // Monday
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Sunday
    endDate.setHours(23, 59, 59, 999);

    const weekNumber = getWeekNumber(today);

    let week = await Week.findOne({ weekNumber });

    if (!week) {
        week = await Week.create({
            weekNumber,
            startDate,
            endDate
        });
    }

    return week;
}

/**
 * Get ISO week number
 */
function getWeekNumber(date) {
    const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    return Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
}

module.exports = { getCurrentWeek };
