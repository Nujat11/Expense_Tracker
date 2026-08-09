import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WalletView from './pages/WalletView';
import WalletsList from './pages/WalletsList';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet/:walletName" element={<WalletView />} />
          <Route path="/wallets" element={<WalletsList />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
