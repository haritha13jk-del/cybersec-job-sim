import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { progressAPI } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await progressAPI.getStats();

        console.log("DASHBOARD STATS:", res.data);

        setStats(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <Navbar />

      <div style={{ padding: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
          Welcome back 👋
        </h1>

        <p style={{ color: "#718096", marginBottom: "24px" }}>
          Track your cybersecurity training progress
        </p>

        {loading ? (
          <div className="card">Loading dashboard...</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            <div className="card">
              <h3>Total Attempts</h3>
              <p style={{ fontSize: "22px", fontWeight: "700" }}>
                {stats?.totalAttempts || 0}
              </p>
            </div>

            <div className="card">
              <h3>Completed</h3>
              <p style={{ fontSize: "22px", fontWeight: "700" }}>
                {stats?.completed || 0}
              </p>
            </div>

            <div className="card">
              <h3>Average Score</h3>
              <p style={{ fontSize: "22px", fontWeight: "700" }}>
                {stats?.averageScore || 0}%
              </p>
            </div>

            <div className="card">
              <h3>Best Score</h3>
              <p style={{ fontSize: "22px", fontWeight: "700" }}>
                {stats?.bestScore || 0}%
              </p>
            </div>
          </div>
        )}

        {/* Quick Start */}
        <div style={{ marginTop: "32px" }}>
          <h2 style={{ marginBottom: "12px" }}>🚀 Quick Start</h2>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a className="card" href="/scenarios?role=SOC Analyst">
              🔍 SOC Analyst
            </a>

            <a className="card" href="/scenarios?role=Penetration Tester">
              ⚔️ Penetration Tester
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}