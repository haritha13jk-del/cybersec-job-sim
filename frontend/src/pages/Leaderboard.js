import React, { useState, useEffect } from 'react';
import { progressAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await progressAPI.getLeaderboard(20);
        setLeaderboard(res.data.leaderboard);
        setUserRank(res.data.userRank);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return { background: '#fffbeb', border: '1px solid #fbd38d' };
    if (rank === 2) return { background: '#f7fafc', border: '1px solid #e2e8f0' };
    if (rank === 3) return { background: '#fff5f5', border: '1px solid #feb2b2' };
    return { background: '#ffffff', border: '1px solid #e2e8f0' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <Navbar />
      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 className="page-title">🏆 Leaderboard</h1>
          <p className="page-subtitle">
            Top performers in the CyberSec Simulation Platform
          </p>
          {userRank && (
            <div style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: '#ebf8ff',
              border: '1px solid #bee3f8',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2b6cb0'
            }}>
              Your Current Rank: #{userRank}
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
            <h3 style={{ color: '#2d3748', marginBottom: '8px' }}>No Rankings Yet</h3>
            <p style={{ color: '#718096' }}>Complete scenarios to appear on the leaderboard!</p>
          </div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaderboard.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    ...getRankStyle(entry.rank_position),
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.2s',
                    transform: entry.username === user.username ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <div style={{
                    fontSize: entry.rank_position <= 3 ? '28px' : '16px',
                    fontWeight: '800',
                    color: '#2d3748',
                    width: '48px',
                    textAlign: 'center'
                  }}>
                    {getRankIcon(entry.rank_position)}
                  </div>

                  <div style={{
                    width: '44px', height: '44px',
                    background: 'linear-gradient(135deg, #3182ce, #2b6cb0)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '16px', fontWeight: '700',
                    flexShrink: 0
                  }}>
                    {entry.username?.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#2d3748' }}>
                        {entry.full_name || entry.username}
                      </span>
                      {entry.username === user.username && (
                        <span style={{
                          fontSize: '11px', padding: '2px 8px',
                          background: '#3182ce', color: 'white',
                          borderRadius: '10px', fontWeight: '600'
                        }}>You</span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: '#718096' }}>
                      @{entry.username}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', color: '#718096', marginBottom: '2px' }}>Completed</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#38a169' }}>
                      {entry.scenarios_completed}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <div style={{ fontSize: '13px', color: '#718096', marginBottom: '2px' }}>Total Score</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#3182ce' }}>
                      {entry.total_score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}