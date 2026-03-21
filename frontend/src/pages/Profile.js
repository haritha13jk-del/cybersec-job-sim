import React, { useState, useEffect } from 'react';
import { progressAPI, authAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', username: '' });
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await progressAPI.getStats();
        const progressRes = await progressAPI.getProgress();
        setStats(statsRes.data.stats);
        setProgress(progressRes.data.progress || []);
        setFormData({ 
          full_name: user.fullName || '', 
          username: user.username || '' 
        });
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async () => {
    try {
      const res = await authAPI.updateProfile(formData);
      localStorage.setItem('user', JSON.stringify({
        ...user,
        fullName: res.data.user.full_name,
        username: res.data.user.username
      }));
      setMessage('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile. Please try again.');
    }
  };

  const getScoreColor = (score, maxScore) => {
    const pct = (score / maxScore) * 100;
    if (pct >= 80) return '#38a169';
    if (pct >= 60) return '#d69e2e';
    return '#e53e3e';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title">👤 My Profile</h1>
          <p className="page-subtitle">Manage your account and view your training history</p>
        </div>

        {loading ? (
          <div className="loading">Loading profile...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px', height: '80px',
                  background: 'linear-gradient(135deg, #3182ce, #2b6cb0)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '32px', color: 'white', fontWeight: '800'
                }}>
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#2d3748', marginBottom: '4px' }}>
                  {user.fullName || user.username}
                </h2>
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '8px' }}>
                  @{user.username}
                </p>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: user.role === 'admin' ? '#fff5f5' : '#ebf8ff',
                  color: user.role === 'admin' ? '#c53030' : '#2b6cb0',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  {user.role}
                </span>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d3748', marginBottom: '16px' }}>
                  📊 Training Statistics
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Total Attempts', value: stats?.total_attempts || 0, icon: '🎯' },
                    { label: 'Completed', value: stats?.completed_scenarios || 0, icon: '✅' },
                    { label: 'Average Score', value: stats?.avg_score ? `${Math.round(stats.avg_score)}%` : '0%', icon: '📈' },
                    { label: 'Best Score', value: stats?.best_score || 0, icon: '🏆' },
                    { label: 'Time Spent', value: stats?.total_time ? `${Math.round(stats.total_time / 60)} mins` : '0 mins', icon: '⏱️' }
                  ].map((item, index) => (
                    <div key={index} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px',
                      background: '#f7fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <span style={{ fontSize: '13px', color: '#4a5568' }}>{item.icon} {item.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#2d3748' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d3748' }}>
                    ✏️ Edit Profile
                  </h3>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditing(!editing)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {editing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {message && (
                  <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                  </div>
                )}

                {editing ? (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={handleUpdate}
                      style={{ width: '100%' }}
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '10px 12px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#718096', marginBottom: '2px' }}>Full Name</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>{user.fullName || 'Not set'}</div>
                    </div>
                    <div style={{ padding: '10px 12px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#718096', marginBottom: '2px' }}>Email</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>{user.email}</div>
                    </div>
                    <div style={{ padding: '10px 12px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#718096', marginBottom: '2px' }}>Username</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>@{user.username}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2d3748', marginBottom: '20px' }}>
                📋 Training History
              </h3>
              {progress.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                  <h3 style={{ color: '#2d3748', marginBottom: '8px' }}>No Training History</h3>
                  <p>Complete some scenarios to see your history here!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {progress.map((item, index) => (
                    <div key={index} style={{
                      padding: '16px',
                      background: '#f7fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div style={{
                        width: '48px', height: '48px',
                        borderRadius: '10px',
                        background: item.role === 'soc_analyst' ? '#ebf8ff' : '#f3e8ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', flexShrink: 0
                      }}>
                        {item.role === 'soc_analyst' ? '🔍' : '⚔️'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#2d3748', marginBottom: '4px' }}>
                          {item.title}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span className={`badge badge-${item.difficulty}`}>
                            {item.difficulty}
                          </span>
                          <span style={{ fontSize: '12px', color: '#718096' }}>
                            ⏱️ {Math.round(item.time_taken / 60)} mins
                          </span>
                          <span style={{ fontSize: '12px', color: '#718096' }}>
                            Attempt #{item.attempt_number}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '22px', fontWeight: '800',
                          color: getScoreColor(item.score, item.max_score)
                        }}>
                          {item.score}
                        </div>
                        <div style={{ fontSize: '11px', color: '#718096' }}>
                          / {item.max_score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}