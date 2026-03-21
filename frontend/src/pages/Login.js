import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ebf8ff 0%, #f0f4f8 50%, #e6fffa 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #3182ce, #2b6cb0)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px'
          }}>🛡️</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#2d3748', marginBottom: '8px' }}>
            CyberSec Sim
          </h1>
          <p style={{ color: '#718096', fontSize: '15px' }}>
            Professional Cybersecurity Training Platform
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#2d3748', marginBottom: '4px' }}>
            Welcome Back
          </h2>
          <p style={{ color: '#718096', fontSize: '14px', marginBottom: '24px' }}>
            Sign in to continue your training
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#718096', fontSize: '14px' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#3182ce', fontWeight: '600', textDecoration: 'none' }}>
                Create Account
              </Link>
            </p>
          </div>

          <div style={{
            marginTop: '20px', padding: '12px',
            background: '#f7fafc', borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{ fontSize: '12px', color: '#718096', fontWeight: '600', marginBottom: '4px' }}>
              Demo Credentials
            </p>
            <p style={{ fontSize: '12px', color: '#4a5568' }}>
              Email: admin@cybersec.com
            </p>
            <p style={{ fontSize: '12px', color: '#4a5568' }}>
              Password: Admin@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}