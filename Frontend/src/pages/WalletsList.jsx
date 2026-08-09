import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { dataService } from '../dataService';

function WalletsList() {
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return navigate('/login');
    const parsed = JSON.parse(stored);
    setUser(parsed);
    fetchAll(parsed.id);
    // eslint-disable-next-line
  }, []);

  const fetchAll = async (userId) => {
    try {
      const [w, t] = await Promise.all([dataService.getWallets(userId), dataService.getExpenses(userId)]);
      setWallets(w.map(x => x.wallet || x));
      setTransactions(t);
    } catch (err) {
      console.error('Error loading wallets list', err);
    }
  };

  const balanceFor = (name) => {
    const list = transactions.filter(t => (name === 'Main Wallet' ? true : t.wallet === name));
    const income = list.filter(i => i.type === 'Income').reduce((a,c)=>a+c.amount,0);
    const expense = list.filter(i => i.type === 'Expense').reduce((a,c)=>a+c.amount,0);
    return income - expense;
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div className="welcome-msg">All Wallets</div>
            <div className="welcome-sub">Tap a wallet to view its transactions and chart</div>
          </div>
        </div>

        <div className="cards-container" style={{ gap: 16 }}>
          {wallets.map((name) => (
            <div key={name} className="glass-panel" style={{ padding: 16, minWidth: 180, cursor: 'pointer' }} onClick={() => navigate(`/wallet/${encodeURIComponent(name)}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💳</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{name}</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>{balanceFor(name).toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default WalletsList;
