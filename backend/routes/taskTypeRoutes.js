const express = require("express");
const router = express.Router();
const { createTaskType, getTaskTypes } = require("../controllers/taskTypeController");

router.post("/", createTaskType);
router.get("/", getTaskTypes);

module.exports = router;
