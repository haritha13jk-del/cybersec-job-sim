import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authAPI.register(formData);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "fullName", label: "Full Name", type: "text", placeholder: "John Doe" },
    { name: "username", label: "Username", type: "text", placeholder: "johndoe" },
    { name: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
    { name: "password", label: "Password", type: "password", placeholder: "Minimum 6 characters" },
  ];

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logoWrap}>
            <span style={{ fontSize: 36 }}>🛡️</span>
          </div>
          <h1 style={styles.brandTitle}>Join CyberSec Sim</h1>
          <p style={styles.brandSub}>
            Train like a real security professional
          </p>

          <div style={styles.steps}>
            {[
              { num: "1", text: "Create your free account" },
              { num: "2", text: "Choose your role — SOC Analyst or Pentester" },
              { num: "3", text: "Complete scenarios and earn points" },
              { num: "4", text: "Climb the global leaderboard" },
            ].map((step) => (
              <div key={step.num} style={styles.stepItem}>
                <div style={styles.stepNum}>{step.num}</div>
                <span style={styles.stepText}>{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSub}>Start your cybersecurity journey today</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {fields.map((f) => (
              <div key={f.name} style={styles.field}>
                <label style={styles.label}>{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  placeholder={f.placeholder}
                  value={formData[f.name]}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "⏳ Creating Account..." : "Create Account →"}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>Already have an account?</span>
            <div style={styles.dividerLine} />
          </div>

          <Link to="/login" style={{ textDecoration: "none" }}>
            <button style={styles.loginBtn}>Sign In</button>
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
    background: "linear-gradient(145deg, #0f172a 0%, #1a3a5c 50%, #0f172a 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "60px 40px",
  },
  leftContent: { maxWidth: 400, color: "#fff" },
  logoWrap: {
    width: 72, height: 72, borderRadius: 20,
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 24,
  },
  brandTitle: { fontSize: 34, fontWeight: 800, color: "#fff", margin: "0 0 8px" },
  brandSub: { fontSize: 16, color: "#94a3b8", margin: "0 0 44px", lineHeight: 1.6 },
  steps: { display: "flex", flexDirection: "column", gap: 20 },
  stepItem: { display: "flex", alignItems: "center", gap: 16 },
  stepNum: {
    width: 36, height: 36, borderRadius: "50%",
    background: "rgba(37,99,235,0.6)",
    border: "1px solid rgba(96,165,250,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0,
  },
  stepText: { fontSize: 14, color: "#cbd5e1", fontWeight: 500 },
  rightPanel: {
    width: "100%", maxWidth: 500,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 32px", background: "#f8fafc",
  },
  formBox: { width: "100%", maxWidth: 420 },
  formHeader: { marginBottom: 28 },
  formTitle: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" },
  formSub: { fontSize: 14, color: "#64748b", margin: 0 },
  errorBox: {
    background: "#fef2f2", border: "1px solid #fca5a5",
    color: "#b91c1c", padding: "12px 16px", borderRadius: 10,
    fontSize: 13, marginBottom: 18, display: "flex", gap: 8, alignItems: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "11px 14px", borderRadius: 10,
    border: "1px solid #e2e8f0", fontSize: 14,
    outline: "none", background: "#fff",
    transition: "border-color 0.15s",
    width: "100%", boxSizing: "border-box",
  },
  submitBtn: {
    padding: "13px", borderRadius: 10, border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff", fontSize: 15, fontWeight: 700, width: "100%",
    marginTop: 4, boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
  },
  divider: {
    display: "flex", alignItems: "center", gap: 12,
    margin: "24px 0 18px",
  },
  dividerLine: { flex: 1, height: 1, background: "#e2e8f0" },
  dividerText: { fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" },
  loginBtn: {
    width: "100%", padding: "12px", borderRadius: 10,
    border: "1.5px solid #cbd5e1", background: "#fff",
    color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
};