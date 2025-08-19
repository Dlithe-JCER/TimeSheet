// routes/weeklyRoutes.js
const express = require("express");
const router = express.Router();
const Week = require("../models/Week");

// Get weeks for the current month
router.get("/current-month", async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const weeks = await Week.find({
            startDate: { $lte: endOfMonth },
            endDate: { $gte: startOfMonth },
        }).sort({ weekNumber: 1 });

        res.json(weeks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch current month weeks" });
    }
});

module.exports = router;
