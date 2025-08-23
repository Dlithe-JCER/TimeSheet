const Project = require("../models/Project");

// ✅ Create a project
exports.createProject = async (req, res) => {
    try {
        const { name, code, description, startDate, endDate, status } = req.body;

        if (!name || !startDate) {
            return res.status(400).json({ error: "Project name and startDate are required" });
        }

        const project = new Project({
            name,
            code,
            description,
            startDate,
            endDate,
            status: status || "active"
        });

        await project.save();
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get only active projects (default dropdown for TaskManager)
exports.getProjects = async (req, res) => {
    try {
        const today = new Date();

        const projects = await Project.find({
            status: "active",
            $or: [
                { endDate: { $gte: today } },
                { endDate: null }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get ALL projects (for admin views / management)
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get single project
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.status(200).json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Update project
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        if (req.body.status === "done" && !project.completedAt) {
            project.completedAt = new Date();
            await project.save();
        }

        res.status(200).json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Delete project
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
