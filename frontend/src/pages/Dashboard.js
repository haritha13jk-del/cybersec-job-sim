import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { progressAPI } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ✅ FIX: Try getStats first, fallback to getUserProgress
        let res;
        try {
          res = await progressAPI.getStats();
        } catch {
          res = await progressAPI.getUserProgress();
        }

        const data = res?.data?.stats || res?.data?.data || res?.data || {};

        setStats({
          totalAttempts: data.total_attempts ?? data.totalAttempts ?? 0,
          completed: data.scenarios_completed ?? data.completed ?? 0,
          averageScore: data.average_score ?? data.averageScore ?? 0,
          bestScore: data.best_score ?? data.bestScore ?? 0,
        });
      } catch (err) {
        console.error("Dashboard error:", err);
        setStats({ totalAttempts: 0, completed: 0, averageScore: 0, bestScore: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Attempts", value: stats?.totalAttempts ?? 0, icon: "🎯", color: "#3b82f6" },
    { label: "Completed", value: stats?.completed ?? 0, icon: "✅", color: "#10b981" },
    { label: "Average Score", value: `${stats?.averageScore ?? 0}%`, icon: "📊", color: "#f59e0b" },
    { label: "Best Score", value: `${stats?.bestScore ?? 0}%`, icon: "🏆", color: "#8b5cf6" },
  ];

  const quickStart = [
    { label: "SOC Analyst", icon: "🔍", role: "SOC Analyst", desc: "Monitor & detect threats", color: "#3b82f6" },
    { label: "Penetration Tester", icon: "⚔️", role: "Penetration Tester", desc: "Find & exploit vulnerabilities", color: "#ef4444" },
  ];

  return (
    <div style={styles.page}>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Welcome back, {user.username || "User"} 👋
            </h1>
            <p style={styles.subtitle}>Track your cybersecurity training progress</p>
          </div>
          <div style={styles.badge}>
            <span style={{ fontSize: 20 }}>🛡️</span>
            <span style={{ fontWeight: 600, color: "#1e40af" }}>CyberSec Trainee</span>
          </div>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div style={styles.loadingGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <div style={styles.statsGrid}>
            {statCards.map((card) => (
              <div key={card.label} style={styles.statCard}>
                <div style={{ ...styles.statIcon, background: card.color + "1a" }}>
                  <span style={{ fontSize: 24 }}>{card.icon}</span>
                </div>
                <div>
                  <p style={styles.statLabel}>{card.label}</p>
                  <p style={{ ...styles.statValue, color: card.color }}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Start */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🚀 Quick Start</h2>
          <p style={styles.subtitle}>Jump into a scenario for your role</p>
          <div style={styles.quickGrid}>
            {quickStart.map((q) => (
              <Link
                key={q.label}
                to={`/scenarios?role=${encodeURIComponent(q.role)}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{ ...styles.quickCard, borderTop: `4px solid ${q.color}` }}>
                  <span style={{ fontSize: 32 }}>{q.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, color: "#1e293b", margin: 0 }}>{q.label}</p>
                    <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{q.desc}</p>
                  </div>
                  <span style={{ marginLeft: "auto", color: q.color, fontSize: 20 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Nav shortcuts */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📌 Explore</h2>
          <div style={styles.navGrid}>
            {[
              { to: "/scenarios", label: "All Scenarios", icon: "🎯", desc: "Browse all challenges" },
              { to: "/leaderboard", label: "Leaderboard", icon: "🏆", desc: "See top performers" },
              { to: "/profile", label: "My Profile", icon: "👤", desc: "View your stats" },
            ].map((item) => (
              <Link key={item.to} to={item.to} style={{ textDecoration: "none" }}>
                <div style={styles.navCard}>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, color: "#1e293b", margin: 0 }}>{item.label}</p>
                    <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f1f5f9" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 32, flexWrap: "wrap", gap: 16,
  },
  title: { fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: 4, marginBottom: 0 },
  badge: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#dbeafe", padding: "10px 18px",
    borderRadius: 50, border: "1px solid #bfdbfe",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16, marginBottom: 32,
  },
  loadingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16, marginBottom: 32,
  },
  skeletonCard: {
    height: 100, borderRadius: 16, background: "#e2e8f0",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  statCard: {
    background: "#fff", borderRadius: 16, padding: "20px 24px",
    display: "flex", alignItems: "center", gap: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #e2e8f0",
    transition: "transform 0.2s",
  },
  statIcon: {
    width: 52, height: 52, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  statLabel: { color: "#64748b", fontSize: 13, fontWeight: 500, margin: 0 },
  statValue: { fontSize: 26, fontWeight: 800, margin: 0 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 4 },
  quickGrid: { display: "flex", flexDirection: "column", gap: 12, marginTop: 16 },
  quickCard: {
    background: "#fff", borderRadius: 16, padding: "18px 24px",
    display: "flex", alignItems: "center", gap: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #e2e8f0", cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  navGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12, marginTop: 16,
  },
  navCard: {
    background: "#fff", borderRadius: 16, padding: "18px 20px",
    display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0", cursor: "pointer",
    transition: "transform 0.15s",
  },
};