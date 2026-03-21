import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #3182ce, #2b6cb0)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>🛡️</div>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#2d3748' }}>
            CyberSec <span style={{ color: '#3182ce' }}>Sim</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { path: '/', label: '📊 Dashboard' },
            { path: '/scenarios', label: '🎯 Scenarios' },
            { path: '/leaderboard', label: '🏆 Leaderboard' },
            { path: '/profile', label: '👤 Profile' }
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: isActive(item.path) ? '#3182ce' : '#4a5568',
                background: isActive(item.path) ? '#ebf8ff' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 12px',
            background: '#f7fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '28px', height: '28px',
              background: 'linear-gradient(135deg, #3182ce, #2b6cb0)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '12px', fontWeight: '700'
            }}>
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>
              {user.username || 'User'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '13px' }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}