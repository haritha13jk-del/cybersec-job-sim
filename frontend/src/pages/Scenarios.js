import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scenarioAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function Scenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: '', difficulty: '' });

  // FETCH DATA (FIXED)
  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true);

      try {
        const res = await scenarioAPI.getAll();

        console.log("SCENARIOS RESPONSE:", res.data);

        const data =
          res.data?.scenarios ||
          res.data?.data ||
          res.data ||
          [];

        setScenarios(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("ERROR:", err.response || err);
        setScenarios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  // FRONTEND FILTERING (FIXED)
  const filteredScenarios = scenarios.filter((s) => {
    return (
      (!filter.role || s.role === filter.role) &&
      (!filter.difficulty || s.difficulty === filter.difficulty)
    );
  });

  const getRoleIcon = (role) => {
    return role === 'SOC Analyst' ? '🔍' : '⚔️';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      <div className="container" style={{ padding: '32px 24px' }}>
        <h1 className="page-title">🎯 Scenarios</h1>

        {/* FILTERS */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          
          <select
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
          >
            <option value="">All Roles</option>
            <option value="SOC Analyst">SOC Analyst</option>
            <option value="Penetration Tester">Penetration Tester</option>
          </select>

          <select
            value={filter.difficulty}
            onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
          >
            <option value="">All Difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <button onClick={() => setFilter({ role: '', difficulty: '' })}>
            Clear
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div>Loading scenarios...</div>
        ) : filteredScenarios.length === 0 ? (
          <div>No scenarios found</div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            
            {filteredScenarios.map((scenario) => (
              <div key={scenario.id} className="card">
                
                <div style={{ fontSize: '24px' }}>
                  {getRoleIcon(scenario.role)}
                </div>

                <h3>{scenario.title}</h3>

                <p>{scenario.description}</p>

                <div>
                  <small>Difficulty: {scenario.difficulty}</small>
                </div>

                <Link to={`/scenarios/${scenario.id}`}>
                  <button className="btn btn-primary">
                    Start Scenario
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