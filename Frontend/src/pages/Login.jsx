import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { dataService, getStorageMode, setStorageMode, getApiBaseUrl, setApiBaseUrl } from '../dataService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [mode, setMode] = useState(getStorageMode());
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
    
    // Check for logout query param
    const params = new URLSearchParams(location.search);
    if (params.get('logout') === 'true') {
      setShowThankYou(true);
      // Clean up URL
      window.history.replaceState({}, document.title, "/login");
    }
  }, [navigate, location]);

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
    setLoading(true);
    try {
      const userData = await dataService.login(email, password);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.message;
      if (status === 401 || detail?.toLowerCase().includes('credentials') || detail?.toLowerCase().includes('invalid')) {
        setError('Invalid credentials. Please check your email and password.');
      } else if (status === 404) {
        setError('No account found with this email address.');
      } else if (!err.response && mode !== 'local') {
        setError('Unable to connect to server. If using Render free backend, it takes ~50s to wake up from sleep on first request. Please wait a moment and try again!');
      } else {
        setError(detail || 'Login failed. Please try again.');
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
          <h2>Take control of your <span>finances</span> today</h2>
          <p>Track every taka, understand your habits, and reach your financial goals with ease.</p>
          <div className="auth-features">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">📊</div>
              <div className="auth-feature-text">
                <strong>Visual Analytics</strong>
                Charts and insights at a glance
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">🔒</div>
              <div className="auth-feature-text">
                <strong>Secure & Private</strong>
                Your data stays yours
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">⚡</div>
              <div className="auth-feature-text">
                <strong>Real-time Tracking</strong>
                Instant updates on every transaction
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-box-header">
            <h1>Welcome back</h1>
            <p>Sign in to manage your expenses {mode === 'local' ? '(Local Mode)' : '(API Mode)'}</p>
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

          {showThankYou && (
            <div className="success-msg" style={{textAlign: "center", padding: "12px", background: "rgba(46, 204, 113, 0.1)", color: "#2ecc71", borderRadius: "10px", marginBottom: "20px", border: "1px solid rgba(46, 204, 113, 0.2)"}}>
              ✨ Thank you for using Expense Tracker!
            </div>
          )}

          {error && (
            <div className="error-msg" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`btn-primary ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? '' : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider">or</div>
          <Link to="/register" className="auth-link">
            Don&apos;t have an account? <strong>Create one free</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
