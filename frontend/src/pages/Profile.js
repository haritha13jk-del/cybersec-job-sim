import React, { useEffect, useState } from "react";

import { progressAPI } from "../services/api";

export default function Profile() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await progressAPI.getUserProgress();
        setProgress(res.data?.stats || res.data?.data || res.data || null);
      } catch (err) {
        console.error("Profile load error:", err);
        setProgress(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const initials = (user.username || user.email || "U")
    .slice(0, 2)
    .toUpperCase();

  const statItems = [
    { label: "Total Score", value: progress?.total_score || 0, icon: "⭐", color: "#f59e0b" },
    { label: "Completed", value: progress?.scenarios_completed || 0, icon: "✅", color: "#10b981" },
    { label: "Avg Score", value: `${progress?.average_score || 0}%`, icon: "📊", color: "#3b82f6" },
    { label: "Best Score", value: `${progress?.best_score || 0}%`, icon: "🏆", color: "#8b5cf6" },
  ];

  return (
    <div style={styles.page}>

      <div style={styles.container}>
        <h1 style={styles.title}>👤 My Profile</h1>

        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.avatarLarge}>{initials}</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
              {user.full_name || user.username || "User"}
            </h2>
            <p style={{ margin: "4px 0 0", color: "#64748b" }}>@{user.username || "user"}</p>
            {user.email && (
              <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: 13 }}>
                ✉ {user.email}
              </p>
            )}
            <div style={styles.roleBadge}>
              🛡️ CyberSec Trainee
            </div>
          </div>
        </div>

        {/* Stats */}
        <h2 style={styles.sectionTitle}>📈 Your Stats</h2>

        {loading ? (
          <div style={styles.statsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <div style={styles.statsGrid}>
            {statItems.map((item) => (
              <div key={item.label} style={styles.statCard}>
                <div style={{ ...styles.statIcon, background: item.color + "1a" }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                </div>
                <div>
                  <p style={styles.statLabel}>{item.label}</p>
                  <p style={{ ...styles.statValue, color: item.color }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Account Info */}
        <h2 style={styles.sectionTitle}>🔐 Account Info</h2>
        <div style={styles.infoCard}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Username</span>
            <span style={styles.infoValue}>{user.username || "—"}</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Email</span>
            <span style={styles.infoValue}>{user.email || "—"}</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Member Since</span>
            <span style={styles.infoValue}>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "—"}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          style={styles.logoutBtn}
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f1f5f9" },
  container: { maxWidth: 800, margin: "0 auto", padding: "32px 24px" },
  title: { fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 24 },
  profileCard: {
    background: "#fff", borderRadius: 20, padding: "28px 32px",
    display: "flex", alignItems: "center", gap: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0",
    marginBottom: 32, flexWrap: "wrap",
  },
  avatarLarge: {
    width: 80, height: 80, borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff", display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 800, fontSize: 28, flexShrink: 0,
  },
  roleBadge: {
    display: "inline-block", marginTop: 8,
    background: "#dbeafe", color: "#1d4ed8",
    padding: "4px 12px", borderRadius: 20,
    fontSize: 12, fontWeight: 600,
  },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 16 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 14, marginBottom: 32,
  },
  skeletonCard: { height: 90, borderRadius: 16, background: "#e2e8f0" },
  statCard: {
    background: "#fff", borderRadius: 16, padding: "18px 20px",
    display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0",
  },
  statIcon: {
    width: 46, height: 46, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  statLabel: { color: "#64748b", fontSize: 12, fontWeight: 500, margin: 0 },
  statValue: { fontSize: 22, fontWeight: 800, margin: 0 },
  infoCard: {
    background: "#fff", borderRadius: 16,
    border: "1px solid #e2e8f0", overflow: "hidden",
    marginBottom: 32,
  },
  infoRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 24px",
  },
  infoLabel: { color: "#64748b", fontWeight: 500, fontSize: 14 },
  infoValue: { color: "#0f172a", fontWeight: 600, fontSize: 14 },
  divider: { borderTop: "1px solid #f1f5f9" },
  logoutBtn: {
    background: "#fff", color: "#ef4444",
    border: "1px solid #fca5a5", borderRadius: 12,
    padding: "12px 24px", fontSize: 14, fontWeight: 700,
    cursor: "pointer", transition: "background 0.2s",
  },
};