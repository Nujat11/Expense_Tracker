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
      <div className="navbar-brand">💰 Expense Tracker</div>
      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
            style={{ 
              fontSize: '0.85rem', 
              padding: '6px 12px', 
              borderRadius: '15px', 
              background: 'rgba(0, 0, 0, 0.2)', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              color: mode === 'local' ? '#00d4ff' : '#2ecc71',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {mode === 'local' ? '🔒 Browser Local Storage' : '🌐 API Mode'}
          </button>
        )}
        {user?.name && (
          <div className="navbar-user">👋 {user.name}</div>
        )}
        <button className="btn-danger" style={{ padding: '8px 16px' }} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
