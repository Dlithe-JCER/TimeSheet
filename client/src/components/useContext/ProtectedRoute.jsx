import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext"; // adjust path if needed

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { user } = useUser();

    if (!user) {
        // Not logged in → go to login
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== "admin") {
        // Not admin but trying to access admin route → go home
        return <Navigate to="/homepage" replace />;
    }

    // Authorized → render page
    return children;
}
