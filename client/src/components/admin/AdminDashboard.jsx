import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FolderKanban, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();

    const cards = [
        // {
        //     title: "Manage Users",
        //     description: "Add, update, or remove users in the system.",
        //     icon: <Users className="h-12 w-12 text-blue-400" />,
        //     path: "/admin/user",
        // },
        {
            title: "Manage Projects",
            description: "Create and manage projects for your team.",
            icon: <FolderKanban className="h-12 w-12 text-green-400" />,
            path: "/admin/projects",
        },
        {
            title: "View Timesheets",
            description: "Track and review timesheets by user ID and name.",
            icon: <FileText className="h-12 w-12 text-purple-400" />,
            path: "/admin/timesheets",
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10">
            {/* Header */}
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-gray-400 mt-2">
                    Manage users, projects, and timesheets with ease.
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center w-full max-xl">
                {cards.map((card, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        <Card className="rounded-2xl border border-gray-800 bg-gray-900/80 shadow-lg hover:shadow-xl transition w-72">
                            <CardHeader className="flex flex-col items-center">
                                <div className="mb-4 p-4 rounded-full bg-gray-800">
                                    {card.icon}
                                </div>
                                <CardTitle className="text-xl font-semibold">
                                    {card.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-gray-400 mb-6">{card.description}</p>
                                <Button
                                    onClick={() => navigate(card.path)}
                                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 transition"
                                >
                                    Open
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );

}

export default AdminDashboard;
