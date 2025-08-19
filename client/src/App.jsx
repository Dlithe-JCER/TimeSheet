import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { LoginPage } from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import HomePage from "./components/pages/HomePage";
import LandingPage from "./components/LandingPage"
function App() {
  const [resetEmail, setResetEmail] = useState("");

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route
          path="/login"
          element={
            <LoginPage
              onForgotPassword={() => {
                // Navigate handled inside LoginPage using useNavigate
              }}
            />
          }
        />
        <Route
          path="/"
          element={<LandingPage />}
        />
        {/* Forgot Password */}
        <Route
          path="/forgot"
          element={
            <ForgotPassword
              onBack={() => {
                // Navigate handled inside ForgotPassword using useNavigate
              }}
              onCodeSent={(email) => {
                setResetEmail(email);
                // Navigate handled inside ForgotPassword
              }}
            />
          }
        />

        {/* Reset Password */}
        <Route
          path="/reset"
          element={
            <ResetPassword
              email={resetEmail}
              onBack={() => {
                // Navigate handled inside ResetPassword using useNavigate
              }}
            />
          }
        />

        {/* After Login → Homepage */}
        <Route path="/homepage" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
