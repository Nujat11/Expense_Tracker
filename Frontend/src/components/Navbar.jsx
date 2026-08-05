import { useNavigate } from 'react-router-dom';
import { getStorageMode } from '../dataService';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const mode = getStorageMode();

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
          <span style={{ 
            fontSize: '0.85rem', 
            padding: '6px 12px', 
            borderRadius: '15px', 
            background: 'rgba(0, 0, 0, 0.2)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            color: mode === 'local' ? '#00d4ff' : '#2ecc71',
            fontWeight: '600'
          }}>
            {mode === 'local' ? '🔒 Browser Local Storage' : '🌐 In-memory API Server'}
          </span>
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
