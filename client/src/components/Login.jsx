import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./useContext/UserContext";
import AlertMessage from "./AlertMessage"; // 👈 import reusable alert
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const navigate = useNavigate();
    const { setUser } = useUser();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setAlert({ type: "success", message: "Login success ✅" });

                // store user + token
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                // update context
                setUser(data.user);

                // redirect after 1s delay (so user sees message)
                setTimeout(() => {
                    if (data.user.role === "admin") {
                        navigate("/admin");
                    } else {
                        navigate("/homepage");
                    }
                }, 1000);
            } else {
                setAlert({ type: "error", message: data.message || "Login failed ❌" });
            }
        } catch (err) {
            console.error(err);
            setAlert({ type: "error", message: "Error logging in ❌" });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            {/* ✅ AlertMessage */}
            <AlertMessage
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ type: "", message: "" })}
            />

            <div className="bg-gray-900 p-10 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 rounded bg-black text-white border border-gray-700"
                        required
                    />
                    <input
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 rounded bg-black text-white border border-gray-700"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Login
                    </button>
                </form>

                <p className="text-gray-500 text-center mt-6 text-sm">
                    <span
                        onClick={() => navigate("/forgot")}
                        className="text-blue-500 cursor-pointer hover:underline"
                    >
                        Forgot Password?
                    </span>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
