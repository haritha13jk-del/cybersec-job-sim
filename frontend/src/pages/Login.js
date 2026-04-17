import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authAPI.login({ email, password });

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ SAFE TOKEN HANDLING (IMPORTANT FIX)
      const token =
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.data?.token;

      const user =
        res.data?.user ||
        res.data?.data?.user;

      if (!token) {
        throw new Error("Token not received from backend");
      }

      // Save auth data
      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // IMPORTANT: reload ensures protected routes re-evaluate token
      window.location.href = "/";

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #ebf8ff 0%, #f0f4f8 50%, #e6fffa 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            background: "linear-gradient(135deg, #3182ce, #2b6cb0)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "28px"
          }}>
            🛡️
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#2d3748" }}>
            CyberSec Sim
          </h1>

          <p style={{ color: "#718096", fontSize: "15px" }}>
            Cybersecurity Training Platform
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "20px", fontWeight: "700" }}>
            Welcome Back
          </h2>

          <p style={{ color: "#718096", marginBottom: "24px" }}>
            Sign in to continue
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <Link to="/register" style={{ color: "#3182ce" }}>
              Create account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}