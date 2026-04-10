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
          full_name: user?.fullName || '',
          username: user?.username || ''
        });

      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.fullName, user?.username]); // ✅ FIXED HERE

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

            {/* LEFT SIDE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* PROFILE CARD */}
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #3182ce, #2b6cb0)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '32px',
                  color: 'white',
                  fontWeight: '800'
                }}>
                  {user?.username?.charAt(0)?.toUpperCase()}
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#2d3748' }}>
                  {user?.fullName || user?.username}
                </h2>

                <p style={{ color: '#718096' }}>
                  @{user?.username}
                </p>
              </div>

              {/* EDIT PROFILE */}
              <div className="card">
                <button onClick={() => setEditing(!editing)}>
                  {editing ? 'Cancel' : 'Edit'}
                </button>

                {editing && (
                  <>
                    <input
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                    />

                    <input
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />

                    <button onClick={handleUpdate}>
                      Save
                    </button>
                  </>
                )}

                {message && <p>{message}</p>}
              </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="card">
              <h3>Training History</h3>

              {progress.length === 0 ? (
                <p>No history yet</p>
              ) : (
                progress.map((item, index) => (
                  <div key={index}>
                    <p>{item.title}</p>
                    <p>Score: {item.score}/{item.max_score}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}