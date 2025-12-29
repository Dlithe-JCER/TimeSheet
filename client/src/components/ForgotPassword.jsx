import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import AlertMessage from "./AlertMessage"; // ✅ Reusable alert

// Base URL from .env (e.g. VITE_API_BASE_URL=https://timesheet-ldbb.onrender.com/api)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function ForgotPassword() {
    const [step, setStep] = useState(1); // 1=email, 2=code, 3=new password
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Send reset code
    const sendCode = async () => {
        if (!email || !email.includes('@')) {
            setAlert({ type: "error", message: "Please enter a valid email address" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setAlert({ type: "success", message: data.message || "Code sent to your email ✅" });
                setTimeout(() => setStep(2), 1500);
            } else {
                setAlert({ type: "error", message: data.message || "Failed to send code ❌" });
            }
        } catch (err) {
            console.error("Send code error:", err);
            setAlert({ type: "error", message: "Network error. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    // Verify code
    const verifyCode = async () => {
        if (!code || code.length !== 6) {
            setAlert({ type: "error", message: "Please enter the 6-digit code" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/verify-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();

            if (res.ok) {
                setAlert({ type: "success", message: data.message || "Code verified ✅" });
                setTimeout(() => setStep(3), 1500);
            } else {
                setAlert({ type: "error", message: data.message || "Invalid code ❌" });
            }
        } catch (err) {
            console.error("Verify code error:", err);
            setAlert({ type: "error", message: "Network error. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    // Reset password
    const resetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            setAlert({ type: "error", message: "Password must be at least 6 characters long" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });
            const data = await res.json();

            if (res.ok) {
                setAlert({ type: "success", message: data.message || "Password reset successful ✅" });

                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else {
                setAlert({ type: "error", message: data.message || "Failed to reset password ❌" });
            }
        } catch (err) {
            console.error("Reset password error:", err);
            setAlert({ type: "error", message: "Network error. Please try again." });
        } finally {
            setLoading(false);
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
                        <p className="text-gray-400 text-sm mb-4">
                            Enter your email address and we'll send you a verification code
                        </p>
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mb-4 bg-black text-white border-gray-700"
                            disabled={loading}
                        />
                        <Button
                            onClick={sendCode}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Verification Code"}
                        </Button>
                        <p className="text-gray-500 text-center mt-4 text-sm">
                            <span
                                onClick={() => navigate("/")}
                                className="text-blue-500 cursor-pointer hover:underline"
                            >
                                Back to Login
                            </span>
                        </p>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className="text-xl font-bold mb-4">Enter Verification Code</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            We sent a 6-digit code to {email}
                        </p>
                        <Input
                            type="text"
                            placeholder="6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            className="mb-4 bg-black text-white border-gray-700 text-center text-2xl tracking-widest"
                            disabled={loading}
                        />
                        <Button
                            onClick={verifyCode}
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify Code"}
                        </Button>
                        <p className="text-gray-500 text-center mt-4 text-sm">
                            <span
                                onClick={() => setStep(1)}
                                className="text-blue-500 cursor-pointer hover:underline"
                            >
                                Resend Code
                            </span>
                        </p>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Enter your new password (minimum 6 characters)
                        </p>
                        <Input
                            type="password"
                            placeholder="New password (min 6 characters)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mb-4 bg-black text-white border-gray-700"
                            disabled={loading}
                        />
                        <Button
                            onClick={resetPassword}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
