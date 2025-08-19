import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function ForgotPassword() {
    const [step, setStep] = useState(1); // 1=email, 2=code, 3=new password
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // API base
    const API = "http://localhost:9000/api/auth";

    // Send reset code
    const sendCode = async () => {
        const res = await fetch(`${API}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        alert(data.message);
        if (res.ok) setStep(2);
    };

    // Verify code
    const verifyCode = async () => {
        const res = await fetch(`${API}/verify-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code }),
        });
        const data = await res.json();
        alert(data.message);
        if (res.ok) setStep(3);
    };

    // Reset password
    const resetPassword = async () => {
        const res = await fetch(`${API}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, newPassword }),
        });
        const data = await res.json();
        alert(data.message);
        if (res.ok) setStep(1); // back to login flow
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
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