import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AlertMessage from "./AlertMessage"; 

export function ResetPassword({ email }) {
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();

        try {
            // Step 1: Verify code
            const verifyRes = await fetch("http://localhost:9000/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
                setAlert({ type: "error", message: verifyData.message || "Invalid code ❌" });
                return;
            }
            const resetRes = await fetch("http://localhost:9000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });
            const resetData = await resetRes.json();

            if (resetRes.ok) {
                setAlert({ type: "success", message: "Password reset successful! ✅ Redirecting..." });
                setTimeout(() => navigate("/login"), 2000); 
            } else {
                setAlert({ type: "error", message: resetData.message || "Failed to reset password ❌" });
            }
        } catch (err) {
            setAlert({ type: "error", message: "Something went wrong. Please try again ❌" });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white relative">
      
            <Button
                onClick={() => navigate("/login")}
                className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white"
            >
                Go Back
            </Button>

         
            <AlertMessage
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ type: "", message: "" })}
            />

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
                        required
                    />
                    <Input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-black text-white border-gray-700"
                        required
                    />
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        Reset Password
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}

export default ResetPassword;
