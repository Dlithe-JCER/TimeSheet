const Project = require("../models/Project");


// ✅ Create a project
exports.createProject = async (req, res) => {
    try {
        const { name, code, description, startDate, endDate, status } = req.body;

        if (!name) {   // ✅ only name is required now
            return res.status(400).json({ error: "Project name is required" });
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

// ✅ Bulk create projects
exports.bulkCreateProjects = async (req, res) => {
    try {
        const { projects } = req.body;

        // Validate input
        if (!projects || !Array.isArray(projects) || projects.length === 0) {
            return res.status(400).json({
                error: "Projects array is required and must not be empty"
            });
        }

        // Validate each project has a name
        const invalidProjects = projects.filter(p => !p.name);
        if (invalidProjects.length > 0) {
            return res.status(400).json({
                error: "All projects must have a name field"
            });
        }

        // Add default status if not provided
        const projectsToCreate = projects.map(project => ({
            ...project,
            status: project.status || "active"
        }));

        // Insert multiple projects
        const createdProjects = await Project.insertMany(projectsToCreate, {
            ordered: false // Continue inserting even if some fail
        });

        res.status(201).json({
            message: `Successfully created ${createdProjects.length} project(s)`,
            count: createdProjects.length,
            projects: createdProjects
        });
    } catch (err) {
        // Handle duplicate key errors or other validation errors
        if (err.name === 'BulkWriteError') {
            const successCount = err.insertedDocs ? err.insertedDocs.length : 0;
            return res.status(207).json({
                message: `Partially successful: ${successCount} project(s) created`,
                count: successCount,
                projects: err.insertedDocs || [],
                errors: err.writeErrors || []
            });
        }
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
