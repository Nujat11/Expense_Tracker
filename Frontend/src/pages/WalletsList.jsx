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
      const names = w.map(x => x.wallet || x).filter((name) => name !== 'Main Wallet' && name !== 'Savings Wallet');
      setWallets(names);
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

        <div className="wallets-list-container">
          {wallets.map((name) => (
            <div key={name} className="wallet-list-row" onClick={() => navigate(`/wallet/${encodeURIComponent(name)}`)}>
              <div>
                <div className="wallet-list-name">{name}</div>
                <div className="wallet-list-balance">{balanceFor(name).toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</div>
              </div>
              <div className="wallet-list-arrow">›</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default WalletsList;
