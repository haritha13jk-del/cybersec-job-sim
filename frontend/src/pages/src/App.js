import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Dashboard from "./pages/Dashboard";
import Scenarios from "./pages/Scenarios";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

// Auth pages — adjust paths if different in your project
import Login from "./pages/Login";
import Register from "./pages/Register";

// ✅ Protected route wrapper
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ FIX: All protected routes now defined — fixes "No routes matched" errors */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/scenarios"
          element={
            <PrivateRoute>
              <Scenarios />
            </PrivateRoute>
          }
        />
        <Route
          path="/scenarios/:id"
          element={
            <PrivateRoute>
              {/* Replace with your ScenarioDetail component if you have one */}
              <Scenarios />
            </PrivateRoute>
          }
        />

        {/* ✅ FIX: These were missing — caused "No routes matched /leaderboard" and "/profile" */}
        <Route
          path="/leaderboard"
          element={
            <PrivateRoute>
              <Leaderboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}