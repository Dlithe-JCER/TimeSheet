import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { Briefcase, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-10 py-5 border-b border-gray-800">
                <h1 className="text-2xl font-bold">
                    Time<span className="text-blue-500">Sheet</span>
                </h1>
                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate("/login")}
                >
                    Login
                </Button>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center text-center px-6 py-20">
                <motion.h2
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-extrabold mb-6"
                >
                    Streamline Your <span className="text-blue-500">Work Hours</span>
                </motion.h2>
                <p className="text-gray-400 max-w-2xl mb-8">
                    A modern corporate time sheet application for employees and managers.
                    Log work, track hours, and approve submissions effortlessly.
                </p>
                <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate("/register")}
                >
                    Get Started
                </Button>
            </section>

            {/* Features */}
            <section className="grid md:grid-cols-3 gap-8 px-10 py-16 max-w-6xl mx-auto">
                <FeatureCard
                    icon={<Clock className="w-10 h-10 text-blue-500" />}
                    title="Track Hours"
                    desc="Easily log daily hours and tasks with a clean interface."
                />
                <FeatureCard
                    icon={<Briefcase className="w-10 h-10 text-blue-500" />}
                    title="Manager Review"
                    desc="Managers can approve or reject timesheets in one click."
                />
                <FeatureCard
                    icon={<CheckCircle className="w-10 h-10 text-blue-500" />}
                    title="Workflow Ready"
                    desc="A clear process from draft → submit → approve."
                />
            </section>

            {/* Footer */}
            <footer className="text-center text-gray-500 py-8 border-t border-gray-800">
                © 2025 Corporate Timesheet. All rights reserved.
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-400">{desc}</p>
        </div>
    );
}
