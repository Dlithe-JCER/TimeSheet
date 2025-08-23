const express = require("express");
const {
    createProject,
    getProjects,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

// Routes
router.post("/", createProject);
router.get("/", getProjects);        // only active
router.get("/all", getAllProjects);  // all projects
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;
