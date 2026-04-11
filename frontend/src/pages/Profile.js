import React, { useState, useEffect, useCallback } from 'react';
import { progressAPI, authAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', username: '' });
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('success');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = useCallback(async () => {
    try {
      const res = await progressAPI.getProgress();
      setProgress(res.data.progress || []);
      setStats(res.data.stats || {});
      setFormData({
        full_name: user?.fullName || '',
        username: user?.username || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.fullName, user?.username]); // eslint-disable-line react-hooks/exhaustive-deps

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
      setMsgType('success');
      setEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Update failed. Please try again.');
      setMsgType('error');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = { beginner: '#27ae60', intermediate: '#f39c12', advanced: '#e74c3c' };
    return colors[difficulty] || '#666';
  };

  const getScoreColor = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return '#27ae60';
    if (pct >= 50) return '#f39c12';
    return '#e74c3c';
  };

  const styles = {
    page: { minHeight: '100vh', background: '#f8f9fa', color: '#1a202c' },
    container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' },
    header: { display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    avatar: { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'white', flexShrink: 0 },
    username: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1a202c', margin: 0 },
    email: { color: '#718096', margin: '0.25rem 0 0' },
    editBtn: { marginLeft: 'auto', padding: '0.5rem 1.2rem', background: editing ? '#e2e8f0' : 'linear-gradient(135deg, #667eea, #764ba2)', color: editing ? '#4a5568' : 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    statNum: { fontSize: '1.8rem', fontWeight: 'bold', color: '#667eea' },
    statLabel: { color: '#718096', fontSize: '0.85rem', marginTop: '0.25rem' },
    section: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    sectionTitle: { fontSize: '1.1rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' },
    editForm: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    input: { padding: '0.75rem 1rem', background: '#f8f9fa', border: '1px solid #cbd5e0', borderRadius: '8px', color: '#1a202c', fontSize: '1rem', outline: 'none' },
    label: { color: '#4a5568', fontSize: '0.85rem', marginBottom: '0.25rem' },
    saveBtn: { padding: '0.75rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
    cancelBtn: { padding: '0.75rem', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    msgBox: { padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: '500' },
    historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid #e2e8f0' },
    badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', color: 'white' },
    scoreBar: { height: '6px', borderRadius: '3px', background: '#e2e8f0', marginTop: '0.4rem', width: '120px' },
    empty: { textAlign: 'center', color: '#718096', padding: '2rem' }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>

        <div style={styles.header}>
          <div style={styles.avatar}>
            {(user?.fullName || user?.username || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p style={styles.username}>{user?.fullName || user?.username}</p>
            <p style={styles.email}>@{user?.username}</p>
          </div>
          <button style={styles.editBtn} onClick={() => setEditing(!editing)}>
            {editing ? '✕ Cancel' : '✎ Edit Profile'}
          </button>
        </div>

        {message && (
          <div style={{ ...styles.msgBox, background: msgType === 'success' ? '#f0fff4' : '#fff5f5', border: `1px solid ${msgType === 'success' ? '#27ae60' : '#e74c3c'}`, color: msgType === 'success' ? '#27ae60' : '#e74c3c' }}>
            {message}
          </div>
        )}

        {editing && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Edit Profile</div>
            <div style={styles.editForm}>
              <div>
                <div style={styles.label}>Full Name</div>
                <input style={styles.input} value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="Full Name" />
              </div>
              <div>
                <div style={styles.label}>Username</div>
                <input style={styles.input} value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="Username" />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={styles.saveBtn} onClick={handleUpdate}>Save Changes</button>
                <button style={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div style={styles.statsGrid}>
            {[
              { label: 'Total Attempts', value: stats.total_attempts || 0 },
              { label: 'Completed', value: stats.completed_scenarios || 0 },
              { label: 'Avg Score', value: stats.avg_score ? Math.round(stats.avg_score) : 0 },
              { label: 'Best Score', value: stats.best_score || 0 },
            ].map((s, i) => (
              <div key={i} style={styles.statCard}>
                <div style={styles.statNum}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionTitle}>📋 Scenario History</div>
          {loading ? (
            <div style={styles.empty}>Loading...</div>
          ) : progress.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <div>No scenarios completed yet. Start training!</div>
            </div>
          ) : (
            progress.map((item, i) => (
              <div key={i} style={styles.historyItem}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1a202c', marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ ...styles.badge, background: getDifficultyColor(item.difficulty) }}>{item.difficulty}</span>
                    <span style={{ color: '#718096', fontSize: '0.8rem' }}>{item.role}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: getScoreColor(item.score, item.max_score || 100), fontSize: '1.1rem' }}>
                    {item.score}/{item.max_score || 100}
                  </div>
                  <div style={styles.scoreBar}>
                    <div style={{ height: '100%', borderRadius: '3px', width: `${Math.min(100, (item.score / (item.max_score || 100)) * 100)}%`, background: getScoreColor(item.score, item.max_score || 100) }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}