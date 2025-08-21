import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FolderKanban, PlusCircle, Trash2 } from "lucide-react";
import axios from "axios";

function ManageProjects() {
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
    });

    // Fetch projects
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get("http://localhost:9000/api/projects");
            setProjects(res.data);
        } catch (err) {
            console.error("Error fetching projects:", err);
        }
    };

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Add new project
    const handleAddProject = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:9000/api/projects", formData);
            setFormData({ name: "", code: "", description: "" });
            fetchProjects();
        } catch (err) {
            console.error("Error adding project:", err);
        }
    };

    // Delete project
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:9000/api/projects/${id}`);
            fetchProjects();
        } catch (err) {
            console.error("Error deleting project:", err);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <FolderKanban className="h-10 w-10 text-green-400" />
                <h1 className="text-3xl font-bold">Manage Projects</h1>
            </div>

            {/* Add Project Form */}
            <Card className="mb-10 bg-gray-900 border border-gray-800 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="h-6 w-6 text-blue-400" />
                        Add New Project
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleAddProject}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Name</label>
                            <Input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter project name"
                                className="bg-gray-800 border-gray-700 text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Code</label>
                            <Input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="Enter project code"
                                className="bg-gray-800 border-gray-700 text-white"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-2">
                                Description
                            </label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter project description"
                                className="bg-gray-800 border-gray-700 text-white"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <Button
                                type="submit"
                                className="rounded-xl bg-blue-600 hover:bg-blue-700"
                            >
                                Add Project
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Project List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Card
                        key={project._id}
                        className="bg-gray-900 border border-gray-800 shadow-lg hover:shadow-xl transition"
                    >
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span className="text-gray-400">{project.name}</span>
                                <Trash2
                                    className="h-5 w-5 text-red-500 cursor-pointer hover:text-red-700"
                                    onClick={() => handleDelete(project._id)}
                                />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-400 text-sm mb-2">
                                Code: {project.code || "—"}
                            </p>
                            <p className="text-gray-300 text-sm">
                                {project.description || "No description"}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default ManageProjects;
