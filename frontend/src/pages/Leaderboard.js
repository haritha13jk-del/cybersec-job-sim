import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { progressAPI } from "../services/api";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await progressAPI.getLeaderboard();

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

  const medalColors = {
    1: { bg: "#fffbeb", border: "#fcd34d", medal: "#f59e0b", text: "🥇" },
    2: { bg: "#f8fafc", border: "#cbd5e1", medal: "#94a3b8", text: "🥈" },
    3: { bg: "#fff5f5", border: "#fca5a5", medal: "#ef4444", text: "🥉" },
  };

  const getRankDisplay = (rank) => {
    const m = medalColors[rank];
    if (m) return m.text;
    return `#${rank}`;
  };

  const getCardStyle = (rank) => {
    const m = medalColors[rank];
    if (!m) return { background: "#fff", border: "1px solid #e2e8f0" };
    return { background: m.bg, border: `1px solid ${m.border}` };
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🏆 Leaderboard</h1>
            <p style={styles.subtitle}>Top cybersecurity trainees ranked by score</p>
          </div>
          {userRank && (
            <div style={styles.yourRankBadge}>
              <span>Your Rank</span>
              <span style={{ fontSize: 22, fontWeight: 800 }}>#{userRank}</span>
            </div>
          )}
        </div>

        {/* Top 3 Podium (if enough data) */}
        {!loading && leaderboard.length >= 3 && (
          <div style={styles.podium}>
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
              const actualRank = i === 1 ? 1 : i === 0 ? 2 : 3;
              const heights = [100, 130, 85];
              const m = medalColors[actualRank];
              return (
                <div key={entry?.id || i} style={{ ...styles.podiumItem, height: heights[i] + 60, background: m.bg, border: `2px solid ${m.border}` }}>
                  <div style={{ fontSize: 28 }}>{m.text}</div>
                  <div style={styles.podiumAvatar}>
                    {(entry?.username || "U")[0].toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", textAlign: "center" }}>
                    {entry?.username || "User"}
                  </div>
                  <div style={{ fontWeight: 800, color: m.medal || "#f59e0b", fontSize: 16 }}>
                    {entry?.total_score || 0}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={styles.skeletonRow} />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 48 }}>📊</span>
            <h3 style={{ color: "#1e293b" }}>No leaderboard data yet</h3>
            <p style={{ color: "#64748b" }}>Complete scenarios to appear here</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {leaderboard.map((entry, index) => {
              const rank = entry.rank_position || index + 1;
              const isYou = entry.username === user.username;
              return (
                <div
                  key={entry.id || index}
                  style={{
                    ...getCardStyle(rank),
                    ...styles.row,
                    ...(isYou ? { outline: "2px solid #3b82f6" } : {}),
                  }}
                >
                  <div style={styles.rankCell}>
                    {getRankDisplay(rank)}
                  </div>

                  <div style={styles.avatar}>
                    {(entry.username || "U")[0].toUpperCase()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>
                      {entry.full_name || entry.username || "Unknown"}
                      {isYou && (
                        <span style={styles.youTag}>You</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      @{entry.username || "user"}
                    </div>
                  </div>

                  <div style={styles.statCell}>
                    <div style={styles.statLabel}>Completed</div>
                    <div style={{ fontWeight: 700, color: "#10b981", fontSize: 16 }}>
                      {entry.scenarios_completed || 0}
                    </div>
                  </div>

                  <div style={styles.statCell}>
                    <div style={styles.statLabel}>Score</div>
                    <div style={{ fontWeight: 800, color: "#2563eb", fontSize: 18 }}>
                      {entry.total_score || 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f1f5f9" },
  container: { maxWidth: 800, margin: "0 auto", padding: "32px 24px" },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16,
  },
  title: { fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: 6, marginBottom: 0 },
  yourRankBadge: {
    background: "#dbeafe", border: "1px solid #bfdbfe",
    borderRadius: 16, padding: "12px 20px",
    display: "flex", flexDirection: "column", alignItems: "center",
    color: "#1d4ed8", fontWeight: 600,
  },
  podium: {
    display: "flex", justifyContent: "center", alignItems: "flex-end",
    gap: 12, marginBottom: 32,
  },
  podiumItem: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "flex-end", gap: 6,
    padding: "16px 24px", borderRadius: 16, minWidth: 100,
    transition: "transform 0.2s",
  },
  podiumAvatar: {
    width: 40, height: 40, borderRadius: "50%",
    background: "#2563eb", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: 16,
  },
  row: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "14px 20px", borderRadius: 14,
    transition: "transform 0.15s",
  },
  skeletonRow: { height: 70, borderRadius: 14, background: "#e2e8f0" },
  emptyState: {
    textAlign: "center", padding: "60px 20px",
    background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0",
  },
  rankCell: { width: 44, fontWeight: 800, fontSize: 18, textAlign: "center" },
  avatar: {
    width: 42, height: 42, borderRadius: "50%",
    background: "#2563eb", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 16, flexShrink: 0,
  },
  youTag: {
    background: "#2563eb", color: "#fff",
    fontSize: 10, fontWeight: 700,
    padding: "2px 8px", borderRadius: 20,
    marginLeft: 8, verticalAlign: "middle",
  },
  statCell: { textAlign: "center", minWidth: 70 },
  statLabel: { fontSize: 11, color: "#94a3b8", fontWeight: 500 },
};