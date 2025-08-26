const express = require("express");
const {
    createWeeklyLog,
    getWeeklyLogs,
    upsertWeeklyLog,
    getCurrentWeekLogs,
    upsertWeeklyLogsBulk,
    deleteWeeklyLog,
    getAllWeeklyLogs   // ✅ add this
} = require("../controllers/weeklyLogController");

const router = express.Router();

router.post("/", createWeeklyLog);
router.post("/upsert", upsertWeeklyLog);
router.post("/upsert-bulk", upsertWeeklyLogsBulk);
router.get("/user/:userId", getWeeklyLogs);
router.get("/current/:userId", getCurrentWeekLogs);
router.get("/all", getAllWeeklyLogs);   // ✅ new route for admin
router.delete("/:id", deleteWeeklyLog);

module.exports = router;
