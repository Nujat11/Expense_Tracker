import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dataService, getStorageMode, setStorageMode, getApiBaseUrl, setApiBaseUrl } from '../dataService';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(getStorageMode());
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) navigate('/dashboard');
  }, [navigate]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setStorageMode(newMode);
    setError('');
  };

  const handleApiUrlChange = (e) => {
    const val = e.target.value;
    setApiUrl(val);
    setApiBaseUrl(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await dataService.register(name, email, password);
      // Clean redirect to login as original
      navigate('/login');
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      const status = err.response?.status;
      if (status === 409 || detail?.toLowerCase().includes('exist')) {
        setError('An account with this email already exists.');
      } else if (!err.response && mode !== 'local') {
        setError('Unable to connect to server. If using Render free backend, it takes ~50s to wake up from sleep on first request. Please wait 15-30s and try clicking Register again!');
      } else {
        setError(detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-brand">💰 Expense Tracker</div>
          <h2>Start your financial <span>journey</span> today</h2>
          <p>Join and get full control over your income and expenses with beautiful insights.</p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">💳</div>
              <div className="auth-feature-text">
                <strong>Track All Expenses</strong>
                Record and categorize every transaction
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">📈</div>
              <div className="auth-feature-text">
                <strong>Smart Summaries</strong>
                See where your money is going
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">🎯</div>
              <div className="auth-feature-text">
                <strong>Stay on Budget</strong>
                Make informed financial decisions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-box-header">
            <h1>Create account</h1>
            <p>Free forever {mode === 'local' ? '(Local Mode)' : '(API Mode)'}</p>
          </div>

          {/* Storage Mode Toggle Pill */}
          <div style={{
            display: 'flex', 
            background: 'rgba(0, 0, 0, 0.3)', 
            padding: '4px', 
            borderRadius: '25px', 
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <button 
              type="button" 
              onClick={() => handleModeChange('local')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '20px',
                border: 'none',
                background: mode === 'local' ? 'linear-gradient(45deg, #00d4ff, #090979)' : 'transparent',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              🔒 Local Storage
            </button>
            <button 
              type="button" 
              onClick={() => handleModeChange('api')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '20px',
                border: 'none',
                background: mode === 'api' ? 'linear-gradient(45deg, #00d4ff, #090979)' : 'transparent',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              🌐 API Server
            </button>
          </div>

          {/* API Settings dropdown if API mode is selected */}
          {mode === 'api' && (
            <div style={{marginBottom: '15px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'}}>
              <button 
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00d4ff',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left',
                  display: 'block',
                  width: '100%'
                }}
              >
                🛠️ {showSettings ? 'Hide API URL Settings' : 'Configure API Base URL'}
              </button>
              {showSettings && (
                <div style={{marginTop: '10px'}}>
                  <label style={{fontSize: '0.75rem', color: '#aaa', display: 'block', marginBottom: '4px'}}>API Base URL</label>
                  <input 
                    type="text" 
                    className="input-glass" 
                    style={{
                      marginBottom: 0, 
                      padding: '8px 12px', 
                      fontSize: '0.85rem',
                      background: 'rgba(0,0,0,0.5)'
                    }} 
                    value={apiUrl} 
                    onChange={handleApiUrlChange} 
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="error-msg" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-glass-wrapper">
                <span className="input-glass-icon">👤</span>
                <input
                  id="name"
                  type="text"
                  className="input-glass"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-glass-wrapper">
                <span className="input-glass-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  className="input-glass"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-glass-wrapper">
                <span className="input-glass-icon">🔑</span>
                <input
                  id="password"
                  type="password"
                  className="input-glass"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`btn-primary ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? '' : 'Create Account →'}
            </button>
          </form>

          <div className="auth-divider">or</div>
          <Link to="/login" className="auth-link">
            Already have an account? <strong>Sign in</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
