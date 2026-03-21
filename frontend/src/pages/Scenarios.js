import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { scenarioAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function Scenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: '', difficulty: '' });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const role = searchParams.get('role') || '';
    setFilter(prev => ({ ...prev, role }));
  }, [searchParams]);

  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true);
      try {
        const res = await scenarioAPI.getAll(filter);
        setScenarios(res.data.scenarios);
      } catch (err) {
        console.error('Failed to fetch scenarios:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
  }, [filter]);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'beginner': return { bg: '#f0fff4', border: '#9ae6b4', text: '#276749', badge: 'beginner' };
      case 'intermediate': return { bg: '#fffbeb', border: '#fbd38d', text: '#744210', badge: 'intermediate' };
      case 'advanced': return { bg: '#fff5f5', border: '#feb2b2', text: '#742a2a', badge: 'advanced' };
      default: return { bg: '#f7fafc', border: '#e2e8f0', text: '#4a5568', badge: '' };
    }
  };

  const getRoleIcon = (role) => {
    return role === 'soc_analyst' ? '🔍' : '⚔️';
  };

  const getRoleLabel = (role) => {
    return role === 'soc_analyst' ? 'SOC Analyst' : 'Penetration Tester';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title">🎯 Training Scenarios</h1>
          <p className="page-subtitle">
            Choose a scenario to practice your cybersecurity skills
          </p>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '6px' }}>Filter by Role</label>
              <select
                className="form-input"
                style={{ width: 'auto', minWidth: '180px' }}
                value={filter.role}
                onChange={(e) => setFilter({ ...filter, role: e.target.value })}
              >
                <option value="">All Roles</option>
                <option value="soc_analyst">SOC Analyst</option>
                <option value="penetration_tester">Penetration Tester</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '6px' }}>Filter by Difficulty</label>
              <select
                className="form-input"
                style={{ width: 'auto', minWidth: '180px' }}
                value={filter.difficulty}
                onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
              >
                <option value="">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div style={{ marginTop: '22px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setFilter({ role: '', difficulty: '' })}
              >
                Clear Filters
              </button>
            </div>
            <div style={{ marginLeft: 'auto', marginTop: '22px' }}>
              <span style={{ fontSize: '14px', color: '#718096', fontWeight: '600' }}>
                {scenarios.length} scenarios found
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading scenarios...</div>
        ) : scenarios.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ color: '#2d3748', marginBottom: '8px' }}>No Scenarios Found</h3>
            <p style={{ color: '#718096' }}>Try changing your filters</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px'
          }}>
            {scenarios.map((scenario) => {
              const colors = getDifficultyColor(scenario.difficulty);
              return (
                <div key={scenario.id} className="card" style={{
                  border: `1px solid ${colors.border}`,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontSize: '32px' }}>{getRoleIcon(scenario.role)}</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <span className={`badge badge-${colors.badge}`}>
                        {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
                      </span>
                      <span className={`badge ${scenario.role === 'soc_analyst' ? 'badge-soc' : 'badge-pentest'}`}>
                        {getRoleLabel(scenario.role)}
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2d3748', marginBottom: '8px', lineHeight: '1.4' }}>
                    {scenario.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#718096', marginBottom: '16px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {scenario.description}
                  </p>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '12px' }}>🎯</span>
                      <span style={{ fontSize: '12px', color: '#718096' }}>Max Score: {scenario.max_score}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '12px' }}>⏱️</span>
                      <span style={{ fontSize: '12px', color: '#718096' }}>Time: {Math.round(scenario.time_limit / 60)} mins</span>
                    </div>
                    {scenario.mitre_technique && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12px' }}>🔗</span>
                        <span style={{ fontSize: '12px', color: '#718096' }}>MITRE: {scenario.mitre_technique}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 8px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#4a5568', fontWeight: '600' }}>
                      {scenario.category}
                    </span>
                  </div>

                  <Link to={`/scenarios/${scenario.id}`} style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary" style={{ width: '100%' }}>
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