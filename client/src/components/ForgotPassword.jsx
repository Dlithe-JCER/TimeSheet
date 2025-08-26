import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import AlertMessage from "./AlertMessage"; // ✅ Import reusable alert
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export function ForgotPassword() {
    const [step, setStep] = useState(1); // 1=email, 2=code, 3=new password
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" }); // ✅ State for alerts

    // API base


    // Send reset code
    const sendCode = async () => {
        const res = await fetch(`https://timesheet-ldbb.onrender.com/api/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();

        if (res.ok) {
            setAlert({ type: "success", message: data.message || "Code sent ✅" });
            setStep(2);
        } else {
            setAlert({ type: "error", message: data.message || "Failed to send code ❌" });
        }
    };

    // Verify code
    const verifyCode = async () => {
        const res = await fetch(`${API_BASE_URL}/verify-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code }),
        });
        const data = await res.json();

        if (res.ok) {
            setAlert({ type: "success", message: data.message || "Code verified ✅" });
            setStep(3);
        } else {
            setAlert({ type: "error", message: data.message || "Invalid code ❌" });
        }
    };

    // Reset password
    const resetPassword = async () => {
        const res = await fetch(`${API_BASE_URL}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, newPassword }),
        });
        const data = await res.json();

        if (res.ok) {
            setAlert({ type: "success", message: data.message || "Password reset ✅" });
            setStep(1); // back to login flow
        } else {
            setAlert({ type: "error", message: data.message || "Failed to reset password ❌" });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            {/* ✅ Centered Alert */}
            <AlertMessage
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ type: "", message: "" })}
            />

            <div className="bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md">
                {step === 1 && (
                    <>
                        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mb-4 bg-black text-white border-gray-700"
                        />
                        <Button onClick={sendCode} className="w-full bg-blue-600 hover:bg-blue-700">
                            Send Verification Code
                        </Button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className="text-xl font-bold mb-4">Enter Verification Code</h2>
                        <Input
                            type="text"
                            placeholder="6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="mb-4 bg-black text-white border-gray-700"
                        />
                        <Button onClick={verifyCode} className="w-full bg-green-600 hover:bg-green-700">
                            Verify Code
                        </Button>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
                        <Input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mb-4 bg-black text-white border-gray-700"
                        />
                        <Button onClick={resetPassword} className="w-full bg-purple-600 hover:bg-purple-700">
                            Reset Password
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
export default ForgotPassword;
