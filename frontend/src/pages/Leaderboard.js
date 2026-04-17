import React, { useState, useEffect } from "react";
import { progressAPI } from "../services/api";
import Navbar from "../components/Navbar";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);

        const res = await progressAPI.getLeaderboard?.(20)
          || await progressAPI.getUserProgress();

        // SAFE DATA HANDLING
        const data =
          res?.data?.leaderboard ||
          res?.data?.data ||
          res?.data ||
          [];

        setLeaderboard(Array.isArray(data) ? data : []);

        setUserRank(res?.data?.userRank || null);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        setLeaderboard([]);
        setUserRank(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return { background: "#fff7e6", border: "1px solid #fbd38d" };
    if (rank === 2) return { background: "#f7fafc", border: "1px solid #e2e8f0" };
    if (rank === 3) return { background: "#fff5f5", border: "1px solid #feb2b2" };
    return { background: "#ffffff", border: "1px solid #e2e8f0" };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <Navbar />

      <div className="container" style={{ padding: "32px 24px" }}>
        <h1 className="page-title">🏆 Leaderboard</h1>

        <p style={{ color: "#718096", marginBottom: "20px" }}>
          Top cybersecurity trainees ranking
        </p>

        {userRank && (
          <div style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "#ebf8ff",
            border: "1px solid #bee3f8",
            borderRadius: "20px",
            marginBottom: "20px",
            fontWeight: "600",
            color: "#2b6cb0"
          }}>
            Your Rank: #{userRank}
          </div>
        )}

        {loading ? (
          <div>Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "50px" }}>
            <h3>No leaderboard data yet</h3>
            <p>Complete scenarios to appear here</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id || index}
                style={{
                  ...getRankStyle(entry.rank_position || index + 1),
                  padding: "16px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px"
                }}
              >
                <div style={{ width: "40px", fontWeight: "800" }}>
                  {getRankIcon(entry.rank_position || index + 1)}
                </div>

                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#3182ce",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700"
                }}>
                  {(entry.username || "U").charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "700" }}>
                    {entry.full_name || entry.username || "Unknown"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#718096" }}>
                    @{entry.username || "user"}
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "12px", color: "#718096" }}>
                    Completed
                  </div>
                  <div style={{ fontWeight: "700", color: "#38a169" }}>
                    {entry.scenarios_completed || 0}
                  </div>
                </div>

                <div style={{ textAlign: "center", minWidth: "70px" }}>
                  <div style={{ fontSize: "12px", color: "#718096" }}>
                    Score
                  </div>
                  <div style={{ fontWeight: "800", color: "#3182ce" }}>
                    {entry.total_score || 0}
                  </div>
                </div>

                {entry.username === user.username && (
                  <span style={{
                    background: "#3182ce",
                    color: "white",
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "10px"
                  }}>
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}