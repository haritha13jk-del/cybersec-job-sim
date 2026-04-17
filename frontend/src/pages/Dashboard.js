import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressAPI } from '../services/api';
import Navbar from '../components/Navbar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  // SAFE user parsing
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user')) || {};
  } catch (e) {
    user = {};
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await progressAPI.getStats();

        console.log("DASHBOARD API:", res.data);

        setStats(res.data?.stats || {});
        setPerformance(res.data?.performanceByRole || []);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setStats({});
        setPerformance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const COLORS = ['#3182ce', '#38a169', '#d69e2e', '#e53e3e'];

  // SAFE pieData
  const pieData = (performance || []).map(p => ({
    name: p.role === 'soc_analyst' ? 'SOC Analyst' : 'Pen Tester',
    value: parseInt(p.completed || 0)
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
            Welcome back, {user.fullName || user.username || "User"} 👋
          </h1>
          <p className="page-subtitle">
            Track your cybersecurity training progress and improve your skills
          </p>
        </div>

        {loading ? (
          <div className="loading">Loading your dashboard...</div>
        ) : (
          <>
            {/* STATS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {statCards.map((card, index) => (
                <div key={index} className="card" style={{ background: card.color, border: 'none' }}>
                  <div style={{ fontSize: '32px' }}>{card.icon}</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: card.textColor }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '14px', color: '#718096' }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CHARTS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '32px'
            }}>

              {/* BAR CHART */}
              <div className="card">
                <h3>📈 Performance by Role</h3>

                {(performance || []).length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={(performance || []).map(p => ({
                      name: p.role === 'soc_analyst' ? 'SOC Analyst' : 'Pen Tester',
                      score: Math.round(p.avg_score || 0),
                      completed: parseInt(p.completed || 0)
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="#3182ce" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No data yet</p>
                )}
              </div>

              {/* PIE CHART */}
              <div className="card">
                <h3>🎯 Scenarios Completed</h3>

                {pieData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No scenarios completed yet</p>
                )}
              </div>
            </div>

            {/* QUICK START */}
            <div className="card">
  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
    🚀 Quick Start
  </h3>

  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

    {/* SOC ANALYST CARD */}
    <Link
      to="/scenarios?role=soc_analyst"
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          padding: '16px',
          borderRadius: '12px',
          background: '#ebf8ff',
          border: '1px solid #bee3f8',
          cursor: 'pointer',
          transition: '0.2s',
        }}
      >
        <div style={{ fontSize: '20px' }}>🔍</div>
        <div style={{ fontWeight: '700', color: '#2b6cb0' }}>
          SOC Analyst Track
        </div>
        <div style={{ fontSize: '12px', color: '#4a5568' }}>
          Investigate security incidents and alerts
        </div>
      </div>
    </Link>

    {/* PEN TESTER CARD */}
    <Link
      to="/scenarios?role=penetration_tester"
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          padding: '16px',
          borderRadius: '12px',
          background: '#f3e8ff',
          border: '1px solid #d6bcfa',
          cursor: 'pointer',
        }}
      >
        <div style={{ fontSize: '20px' }}>⚔️</div>
        <div style={{ fontWeight: '700', color: '#553c9a' }}>
          Penetration Tester Track
        </div>
        <div style={{ fontSize: '12px', color: '#4a5568' }}>
          Find and exploit vulnerabilities ethically
        </div>
      </div>
    </Link>

  </div>
</div>