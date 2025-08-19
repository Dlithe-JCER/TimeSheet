import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage({ onForgotPassword }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:9000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Login success ✅");
                // store full user details
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/homepage");
            } else {
                alert(data.message || "Login failed");
            }
        } catch (err) {
            alert("Error logging in");
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
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
                        onClick={onForgotPassword}
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
