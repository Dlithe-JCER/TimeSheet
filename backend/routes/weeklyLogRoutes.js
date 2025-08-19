const express = require("express");
const { createWeeklyLog, getWeeklyLogs } = require("../controllers/weeklyLogController");


const router = express.Router();

// Create
router.post("/", createWeeklyLog);

// Fetch by userId + optional week filters
router.get("/user/:userId", getWeeklyLogs);

module.exports = router;
