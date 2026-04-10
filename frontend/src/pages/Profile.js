import React, { useState, useEffect } from 'react';
import { progressAPI, authAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', username: '' });
  const [message, setMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const progressRes = await progressAPI.getProgress();

        setProgress(progressRes.data.progress || []);

        setFormData({
          full_name: user?.fullName || '',
          username: user?.username || ''
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.fullName, user?.username]);

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

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <h1>Profile</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h2>{user?.fullName || user?.username}</h2>

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

              <button onClick={handleUpdate}>Save</button>
            </>
          )}

          {message && <p>{message}</p>}

          <h3>History</h3>

          {progress.length === 0 ? (
            <p>No data</p>
          ) : (
            progress.map((item, i) => (
              <div key={i}>
                <p>{item.title}</p>
                <p>{item.score}/{item.max_score}</p>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}