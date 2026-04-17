import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { scenarioAPI } from "../services/api";


export default function Scenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: "", difficulty: "" });

  const location = useLocation();

  // Read ?role= from URL on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role") || "";
    setFilter((f) => ({ ...f, role: roleParam }));
  }, [location.search]);

  // ✅ FIX: Single clean useEffect for loading — removed duplicate broken code
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await scenarioAPI.getAll();

        const data =
          res.data?.scenarios ||
          res.data?.data ||
          res.data ||
          [];

        setScenarios(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Scenario load failed:", err);
        setScenarios([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = scenarios.filter((s) => {
    return (
      (!filter.role || s.role === filter.role) &&
      (!filter.difficulty || s.difficulty === filter.difficulty)
    );
  });

  const getIcon = (role) => (role === "SOC Analyst" ? "🔍" : "⚔️");

  const difficultyColor = {
    beginner: { bg: "#dcfce7", text: "#16a34a" },
    intermediate: { bg: "#fef9c3", text: "#ca8a04" },
    advanced: { bg: "#fee2e2", text: "#dc2626" },
  };

  return (
    <div style={styles.page}>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🎯 Scenarios</h1>
            <p style={styles.subtitle}>Choose a challenge and test your cybersecurity skills</p>
          </div>
          <div style={styles.countBadge}>
            {filtered.length} scenario{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterBar}>
          <select
            style={styles.select}
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
          >
            <option value="">All Roles</option>
            <option value="SOC Analyst">SOC Analyst</option>
            <option value="Penetration Tester">Penetration Tester</option>
          </select>

          <select
            style={styles.select}
            value={filter.difficulty}
            onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
          >
            <option value="">All Difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <button style={styles.clearBtn} onClick={() => setFilter({ role: "", difficulty: "" })}>
            ✕ Clear
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={styles.grid}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={styles.skeletonCard} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 48 }}>🔎</span>
            <h3 style={{ color: "#1e293b", margin: "12px 0 4px" }}>No scenarios found</h3>
            <p style={{ color: "#64748b" }}>
              {scenarios.length === 0
                ? "The backend returned no data. Check your connection or token."
                : "Try clearing your filters."}
            </p>
            {scenarios.length > 0 && (
              <button style={styles.clearBtn} onClick={() => setFilter({ role: "", difficulty: "" })}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((s) => {
              const diff = s.difficulty?.toLowerCase() || "beginner";
              const diffStyle = difficultyColor[diff] || difficultyColor.beginner;
              return (
                <div key={s.id || s._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.roleIcon}>{getIcon(s.role)}</span>
                    <span style={{ ...styles.diffBadge, background: diffStyle.bg, color: diffStyle.text }}>
                      {s.difficulty || "Beginner"}
                    </span>
                  </div>

                  <h2 style={styles.cardTitle}>{s.title}</h2>
                  <p style={styles.cardDesc}>{s.description}</p>

                  <div style={styles.cardMeta}>
                    <span style={styles.metaTag}>👤 {s.role || "General"}</span>
                    {s.duration && <span style={styles.metaTag}>⏱ {s.duration} min</span>}
                  </div>

                  <Link to={`/scenarios/${s.id || s._id}`} style={{ textDecoration: "none" }}>
                    <button style={styles.startBtn}>
                      Start Scenario →
                    </button>
                  </Link>
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
  container: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12,
  },
  title: { fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: 6, marginBottom: 0 },
  countBadge: {
    background: "#dbeafe", color: "#1d4ed8",
    padding: "8px 16px", borderRadius: 50,
    fontWeight: 700, fontSize: 14,
  },
  filterBar: {
    display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap",
  },
  select: {
    padding: "10px 16px", borderRadius: 10,
    border: "1px solid #cbd5e1", background: "#fff",
    fontSize: 14, color: "#374151", cursor: "pointer",
    outline: "none",
  },
  clearBtn: {
    padding: "10px 18px", borderRadius: 10,
    border: "1px solid #e2e8f0", background: "#fff",
    color: "#64748b", fontSize: 14, cursor: "pointer",
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },
  skeletonCard: {
    height: 220, borderRadius: 16, background: "#e2e8f0",
  },
  emptyState: {
    textAlign: "center", padding: "60px 20px",
    background: "#fff", borderRadius: 20,
    border: "1px solid #e2e8f0",
  },
  card: {
    background: "#fff", borderRadius: 16,
    padding: 24, display: "flex", flexDirection: "column", gap: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    border: "1px solid #e2e8f0",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  roleIcon: { fontSize: 28 },
  diffBadge: {
    fontSize: 12, fontWeight: 700, padding: "4px 10px",
    borderRadius: 20, textTransform: "capitalize",
  },
  cardTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 },
  cardDesc: { fontSize: 14, color: "#64748b", lineHeight: 1.5, margin: 0, flexGrow: 1 },
  cardMeta: { display: "flex", gap: 8, flexWrap: "wrap" },
  metaTag: {
    background: "#f1f5f9", color: "#475569",
    fontSize: 12, padding: "4px 10px", borderRadius: 20,
  },
  startBtn: {
    background: "#2563eb", color: "#fff",
    border: "none", borderRadius: 10, padding: "12px 20px",
    fontWeight: 700, fontSize: 14, cursor: "pointer",
    width: "100%", transition: "background 0.2s",
  },
};