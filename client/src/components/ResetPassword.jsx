import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion } from "framer-motion";

export function ResetPassword({ email, onBack }) {
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleReset = async (e) => {
        e.preventDefault();

        const verifyRes = await fetch("http://localhost:9000/api/auth/verify-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code })
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) return alert(verifyData.message);

        const resetRes = await fetch("http://localhost:9000/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, newPassword })
        });
        const resetData = await resetRes.json();
        if (resetRes.ok) {
            alert("Password reset successful!");
            onBack();
        } else {
            alert(resetData.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 p-10 rounded-2xl shadow-lg w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
                <form onSubmit={handleReset} className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Enter verification code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="bg-black text-white border-gray-700"
                    />
                    <Input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-black text-white border-gray-700"
                    />
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Reset Password
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}
export default ResetPassword;