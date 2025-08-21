const express = require("express");
const {
    createWeeklyLog,
    getWeeklyLogs,
    upsertWeeklyLog,
    getCurrentWeekLogs,
    upsertWeeklyLogsBulk,
    deleteWeeklyLog
} = require("../controllers/weeklyLogController");

const router = express.Router();

router.post("/", createWeeklyLog);
router.post("/upsert", upsertWeeklyLog);
router.post("/upsert-bulk", upsertWeeklyLogsBulk);
router.get("/user/:userId", getWeeklyLogs);
router.get("/current/:userId", getCurrentWeekLogs);
router.delete("/:id", deleteWeeklyLog);

module.exports = router;