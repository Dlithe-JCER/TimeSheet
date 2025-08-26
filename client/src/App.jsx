import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { LoginPage } from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import HomePage from "./components/pages/HomePage";
import LandingPage from "./components/LandingPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProtectedRoute from "./components/useContext/ProtectedRoute";
import { UserProvider } from "./components/useContext/UserContext"
import ManageProjects from "./components/admin/ManageProjects";
// import ManageUsers from "./components/admin/ManageUsers";
import ViewTimeSheet from "./components/admin/ViewTimeSheet";
function App() {
  const [resetEmail, setResetEmail] = useState("");

  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/forgot"
            element={
              <ForgotPassword
                onCodeSent={(email) => setResetEmail(email)}
              />
            }
          />
          <Route
            path="/reset"
            element={<ResetPassword email={resetEmail} />}
          />

          {/* Protected Routes */}
          <Route
            path="/homepage"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute adminOnly={true}>
                <ManageProjects />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/admin/user"
            element={
              <ProtectedRoute adminOnly={true}>
                <ManageUsers />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/admin/timesheets"
            element={
              <ProtectedRoute adminOnly={true}>
                <ViewTimeSheet />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
