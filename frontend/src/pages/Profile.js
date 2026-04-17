import React, { useState, useEffect, useCallback } from 'react';
import { progressAPI, authAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function Profile() { ... }
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', username: '' });
  const [message, setMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = useCallback(async () => {
    try {
      const progressRes = await progressAPI.getProgress();
      setProgress(progressRes.data.progress || []);
      setStats(progressRes.data.stats || {});
      setFormData({
        full_name: user?.fullName || '',
        username: user?.username || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      setMessage('Update failed');
    }
  };

  const getScoreColor = (score, max) => {
    const pct = (score / (max || 100)) * 100;
    if (pct >= 80) return '#38a169';
    if (pct >= 50) return '#d69e2e';
    return '#e53e3e';
  };

  const totalTime = stats.total_time
    ? `${Math.round(stats.total_time / 60)} mins`
    : '0 mins';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />

      <div className="container" style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#2d3748', marginBottom: '4px' }}>
            👤 My Profile
          </h1>
          <p style={{ color: '#718096', fontSize: '14px' }}>
            Manage your account and view your training history
          </p>
        </div>

        {loading ? (
          <div className="loading">Loading profile...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Profile Card */}
              <div className="card">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 0 16px' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', fontWeight: '700', color: '#fff',
                    marginBottom: '14px'
                  }}>
                    {(user?.fullName || user?.username || 'U')[0].toUpperCase()}
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginBottom: '2px' }}>
                    {user?.fullName || user?.username}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#718096', marginBottom: '10px' }}>
                    @{user?.username}
                  </p>
                  <span style={{
                    fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em',
                    padding: '3px 12px', borderRadius: '20px',
                    background: user?.role === 'admin' ? '#fef3c7' : '#ebf8ff',
                    color: user?.role === 'admin' ? '#92400e' : '#2b6cb0',
                    border: `1px solid ${user?.role === 'admin' ? '#fbbf24' : '#90cdf4'}`
                  }}>
                    {(user?.role || 'student').toUpperCase()}
                  </span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 16px' }} />

                {/* Edit toggle */}
                {!editing ? (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => setEditing(true)}
                  >
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      className="form-input"
                      placeholder="Full Name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                    <input
                      className="form-input"
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleUpdate}>Save</button>
                      <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  </div>
                )}

                {message && (
                  <p style={{
                    marginTop: '10px', padding: '8px 12px', borderRadius: '8px',
                    background: message.includes('success') ? '#f0fff4' : '#fff5f5',
                    color: message.includes('success') ? '#276749' : '#c53030',
                    fontSize: '13px', textAlign: 'center'
                  }}>
                    {message}
                  </p>
                )}
              </div>

              {/* Training Statistics */}
              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d3748', marginBottom: '16px' }}>
                  📋 Training Statistics
                </h3>
                {[
                  { label: 'Total Attempts', value: stats.total_attempts || 0, color: '#5a67d8' },
                  { label: 'Completed', value: stats.completed_scenarios || 0, color: '#38a169' },
                  { label: 'Average Score', value: stats.avg_score ? `${Math.round(stats.avg_score)}%` : '0%', color: '#d69e2e' },
                  { label: 'Best Score', value: stats.best_score || 0, color: '#e53e3e' },
                  { label: 'Total Time', value: totalTime, color: '#805ad5' },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid #f7fafc'
                  }}>
                    <span style={{ fontSize: '13px', color: '#718096' }}>{item.label}</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: item.color }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN - Training History */}
            <div className="card" style={{ alignSelf: 'start' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d3748', marginBottom: '16px' }}>
                📋 Training History
              </h3>

              {progress.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                  <p style={{ color: '#718096', fontSize: '14px' }}>No training history yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {progress.map((item, i) => {
                    const scoreColor = getScoreColor(item.score, item.max_score || item.scenario_max_score || 100);
                    const maxScore = item.max_score || item.scenario_max_score || 100;
                    const pct = Math.round((item.score / maxScore) * 100);

                    return (
                      <div key={i} style={{
                        padding: '12px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        background: '#fafafa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        {/* Icon */}
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: '#ebf8ff', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '16px', flexShrink: 0
                        }}>
                          🔍
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: '600', fontSize: '13px', color: '#2d3748', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </p>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '10px', padding: '1px 7px', borderRadius: '20px',
                              background: item.difficulty === 'beginner' ? '#f0fff4' : item.difficulty === 'intermediate' ? '#fffbeb' : '#fff5f5',
                              color: item.difficulty === 'beginner' ? '#276749' : item.difficulty === 'intermediate' ? '#744210' : '#742a2a',
                              border: '1px solid',
                              borderColor: item.difficulty === 'beginner' ? '#9ae6b4' : item.difficulty === 'intermediate' ? '#fbd38d' : '#feb2b2',
                              fontWeight: '600'
                            }}>
                              {item.difficulty}
                            </span>
                            <span style={{ fontSize: '11px', color: '#a0aec0' }}>
                              {item.attempt_number ? `Attempt #${item.attempt_number}` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Score */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: '15px', fontWeight: '700', color: scoreColor, marginBottom: '4px' }}>
                            {item.score}/{maxScore}
                          </p>
                          <div style={{ width: '60px', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: scoreColor, borderRadius: '2px' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}