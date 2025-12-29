const express = require("express");
const {
    createProject,
    bulkCreateProjects,
    getProjects,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

// Routes
router.post("/", createProject);
router.post("/bulk", bulkCreateProjects);  // Bulk create projects
router.get("/", getProjects);        // only active
router.get("/all", getAllProjects);  // all projects
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;
