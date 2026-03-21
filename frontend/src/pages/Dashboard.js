import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await progressAPI.getStats();
        setStats(res.data.stats);
        setPerformance(res.data.performanceByRole);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#3182ce', '#38a169', '#d69e2e', '#e53e3e'];

  const pieData = performance.map(p => ({
    name: p.role === 'soc_analyst' ? 'SOC Analyst' : 'Pen Tester',
    value: parseInt(p.completed) || 0
  }));

  const statCards = [
    { label: 'Total Attempts', value: stats?.total_attempts || 0, icon: '🎯', color: '#ebf8ff', textColor: '#2b6cb0' },
    { label: 'Completed', value: stats?.completed_scenarios || 0, icon: '✅', color: '#f0fff4', textColor: '#276749' },
    { label: 'Average Score', value: stats?.avg_score ? `${Math.round(stats.avg_score)}%` : '0%', icon: '📊', color: '#fffbeb', textColor: '#744210' },
    { label: 'Best Score', value: stats?.best_score || 0, icon: '🏆', color: '#fff5f5', textColor: '#742a2a' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title">
            Welcome back, {user.fullName || user.username}! 👋
          </h1>
          <p className="page-subtitle">
            Track your cybersecurity training progress and improve your skills
          </p>
        </div>

        {loading ? (
          <div className="loading">Loading your dashboard...</div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {statCards.map((card, index) => (
                <div key={index} className="card" style={{ background: card.color, border: 'none' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{card.icon}</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: card.textColor }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '14px', color: '#718096', fontWeight: '600' }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2d3748', marginBottom: '20px' }}>
                  📈 Performance by Role
                </h3>
                {performance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={performance.map(p => ({
                      name: p.role === 'soc_analyst' ? 'SOC Analyst' : 'Pen Tester',
                      score: Math.round(p.avg_score || 0),
                      completed: parseInt(p.completed) || 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#3182ce" radius={[4, 4, 0, 0]} name="Avg Score" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>📊</div>
                    <p>Complete scenarios to see your performance</p>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2d3748', marginBottom: '20px' }}>
                  🎯 Scenarios Completed
                </h3>
                {pieData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎯</div>
                    <p>No scenarios completed yet</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px'
            }}>
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2d3748', marginBottom: '16px' }}>
                  🚀 Quick Start
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to="/scenarios?role=soc_analyst" style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '16px',
                      background: '#ebf8ff',
                      borderRadius: '10px',
                      border: '1px solid #bee3f8',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔍</div>
                      <div style={{ fontWeight: '700', color: '#2b6cb0', fontSize: '14px' }}>SOC Analyst Track</div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>Investigate security incidents and alerts</div>
                    </div>
                  </Link>
                  <Link to="/scenarios?role=penetration_tester" style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '16px',
                      background: '#f3e8ff',
                      borderRadius: '10px',
                      border: '1px solid #d6bcfa',
                      cursor: 'pointer'
                    }}>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>⚔️</div>
                      <div style={{ fontWeight: '700', color: '#553c9a', fontSize: '14px' }}>Penetration Tester Track</div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>Find and exploit vulnerabilities ethically</div>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2d3748', marginBottom: '16px' }}>
                  📋 Training Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Total Time Spent', value: stats?.total_time ? `${Math.round(stats.total_time / 60)} mins` : '0 mins', icon: '⏱️' },
                    { label: 'Scenarios Attempted', value: stats?.total_attempts || 0, icon: '📝' },
                    { label: 'Scenarios Completed', value: stats?.completed_scenarios || 0, icon: '✅' },
                    { label: 'Best Score', value: stats?.best_score || 0, icon: '🏆' }
                  ].map((item, index) => (
                    <div key={index} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px',
                      background: '#f7fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <span style={{ fontSize: '14px', color: '#4a5568' }}>{item.icon} {item.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#2d3748' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}