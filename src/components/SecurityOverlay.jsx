import React, { useState, useEffect } from 'react';
import '../styles/SecurityOverlay.css';

const SecurityOverlay = ({ onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const CORRECT_PASSWORD = 'metalcloud'; // Change this to your desired password

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.toLowerCase() === CORRECT_PASSWORD.toLowerCase()) {
      onAuthenticate();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="security-overlay">


      {/* Login Form */}
      <div className="security-card">
        <div className="security-header">
          <div className="security-logo">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0052CC" />
                  <stop offset="100%" stopColor="#2684FF" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="url(#logoGradient)"/>
              <path d="M30 35 L50 25 L70 35 L70 55 L50 65 L30 55 Z" fill="white" opacity="0.95"/>
              <circle cx="50" cy="45" r="8" fill="#0052CC"/>
            </svg>
          </div>
          <h1 className="security-title">JIRA MetalCloud EM-MIS</h1>
          <p className="security-subtitle">Employee Management Information System</p>
        </div>

        <form onSubmit={handleSubmit} className="security-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">Access Code</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter access code"
              autoFocus
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button type="submit" className="submit-button">
            <span>Enter System</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </form>

        <div className="security-footer">
          <p>Secured by MetalCloud Security</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityOverlay;
