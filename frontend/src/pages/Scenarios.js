import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { scenarioAPI } from "../services/api";
import Navbar from "../components/Navbar";

export default function Scenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: "", difficulty: "" });

  useEffect(() => {
    const fetchScenarios = async () => {
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
        console.log("Scenario fetch error:", err);
        setScenarios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  const filtered = scenarios.filter((s) => {
    return (
      (!filter.role || s.role === filter.role) &&
      (!filter.difficulty || s.difficulty === filter.difficulty)
    );
  });

  const getIcon = (role) =>
    role === "SOC Analyst" ? "🔍" : "⚔️";

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f8" }}>
      <Navbar />

      <div className="container" style={{ padding: "30px" }}>
        <h1>🎯 Scenarios</h1>

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <select
            value={filter.role}
            onChange={(e) =>
              setFilter({ ...filter, role: e.target.value })
            }
          >
            <option value="">All Roles</option>
            <option value="SOC Analyst">SOC Analyst</option>
            <option value="Penetration Tester">Pentester</option>
          </select>

          <select
            value={filter.difficulty}
            onChange={(e) =>
              setFilter({ ...filter, difficulty: e.target.value })
            }
          >
            <option value="">All Difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <button onClick={() => setFilter({ role: "", difficulty: "" })}>
            Clear
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No scenarios found</p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {filtered.map((s) => (
              <div key={s.id || s._id} className="card">
                <h2>
                  {getIcon(s.role)} {s.title}
                </h2>

                <p>{s.description}</p>

                <small>{s.difficulty}</small>

                <br />

                <Link to={`/scenarios/${s.id || s._id}`}>
                  <button className="btn btn-primary">
                    Start
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}