import { useNavigate } from 'react-router-dom';
import { getStorageMode, setStorageMode, getApiBaseUrl, setApiBaseUrl } from '../dataService';
import { useState } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [mode, setMode] = useState(getStorageMode());

  const promptAndSetApi = () => {
    const current = getApiBaseUrl();
    const entered = window.prompt('Enter API base URL (include http://)', current || 'http://localhost:8000');
    if (!entered) return false;
    setApiBaseUrl(entered);
    return true;
  };

  const handleLogout = () => {
    // Clear user session, keep configuration
    localStorage.removeItem('user');
    navigate('/login?logout=true');
  };

  return (
    <nav className="navbar">
      <div 
        className="navbar-brand" 
        style={{ cursor: 'pointer' }} 
        onClick={() => navigate('/dashboard')}
      >
        💰 Expense Tracker
      </div>
      <div className="navbar-right">
        {mode && (
          <button
            onClick={async () => {
              // toggle mode on click
              if (mode === 'local') {
                const ok = promptAndSetApi();
                if (!ok) return;
                setStorageMode('api');
                setMode('api');
                window.location.reload();
              } else {
                setStorageMode('local');
                setMode('local');
                window.location.reload();
              }
            }}
            title="Click to toggle storage mode"
            className={`navbar-toggle-btn ${mode === 'local' ? 'mode-local' : 'mode-api'}`}
          >
            {mode === 'local' ? '🔒 Offline' : '🌐 Online'}
          </button>
        )}
        {user?.name && (
          <div className="navbar-user">👋 {user.name}</div>
        )}
        <button className="btn-danger" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
