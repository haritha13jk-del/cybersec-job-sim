import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

      const token =
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.data?.token;

      const user =
        res.data?.user ||
        res.data?.data?.user;

      if (!token) throw new Error("Token missing from response");

      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logoWrap}>
            <span style={{ fontSize: 36 }}>🛡️</span>
          </div>
          <h1 style={styles.brandTitle}>CyberSec Sim</h1>
          <p style={styles.brandSub}>
            Professional Cybersecurity Training Platform
          </p>

          <div style={styles.featureList}>
            {[
              { icon: "🎯", text: "Real-world incident scenarios" },
              { icon: "🤖", text: "AI-powered security assistant" },
              { icon: "🏆", text: "Global leaderboard rankings" },
              { icon: "📈", text: "Track your progress over time" },
            ].map((f) => (
              <div key={f.text} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSub}>Sign in to continue your training</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span>⏳ Signing in...</span>
              ) : (
                <span>Sign In →</span>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>New to CyberSec Sim?</span>
            <div style={styles.dividerLine} />
          </div>

          <Link to="/register" style={{ textDecoration: "none" }}>
            <button style={styles.registerBtn}>
              Create Free Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 40px",
  },
  leftContent: {
    maxWidth: 400,
    color: "#fff",
  },
  logoWrap: {
    width: 72, height: 72, borderRadius: 20,
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 36, fontWeight: 800, color: "#fff",
    margin: "0 0 8px",
  },
  brandSub: {
    fontSize: 16, color: "#94a3b8",
    margin: "0 0 48px", lineHeight: 1.6,
  },
  featureList: { display: "flex", flexDirection: "column", gap: 20 },
  featureItem: { display: "flex", alignItems: "center", gap: 16 },
  featureIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, flexShrink: 0,
  },
  featureText: { fontSize: 15, color: "#cbd5e1", fontWeight: 500 },
  rightPanel: {
    width: "100%", maxWidth: 480,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 32px",
    background: "#f8fafc",
  },
  formBox: { width: "100%", maxWidth: 400 },
  formHeader: { marginBottom: 32 },
  formTitle: { fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" },
  formSub: { fontSize: 15, color: "#64748b", margin: 0 },
  errorBox: {
    background: "#fef2f2", border: "1px solid #fca5a5",
    color: "#b91c1c", padding: "12px 16px", borderRadius: 10,
    fontSize: 14, marginBottom: 20, display: "flex", gap: 8, alignItems: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "12px 14px", borderRadius: 10,
    border: "1px solid #e2e8f0", fontSize: 14,
    outline: "none", background: "#fff",
    transition: "border-color 0.15s",
    width: "100%", boxSizing: "border-box",
  },
  submitBtn: {
    padding: "14px", borderRadius: 10, border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff", fontSize: 15, fontWeight: 700,
    width: "100%", marginTop: 4,
    boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
    transition: "opacity 0.2s",
  },
  divider: {
    display: "flex", alignItems: "center", gap: 12,
    margin: "28px 0 20px",
  },
  dividerLine: { flex: 1, height: 1, background: "#e2e8f0" },
  dividerText: { fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" },
  registerBtn: {
    width: "100%", padding: "13px", borderRadius: 10,
    border: "1.5px solid #cbd5e1", background: "#fff",
    color: "#374151", fontSize: 14, fontWeight: 600,
    cursor: "pointer", transition: "border-color 0.2s",
  },
};