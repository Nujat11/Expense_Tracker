import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ExpenseChart from '../components/ExpenseChart';
import { dataService, getStorageMode } from '../dataService';

function WalletView() {
  const { walletName } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return navigate('/login');
    const parsed = JSON.parse(stored);
    setUser(parsed);
    fetchData(parsed.id);
    // eslint-disable-next-line
  }, [walletName]);

  const fetchData = async (userId) => {
    setLoading(true);
    try {
      const data = await dataService.getExpenses(userId);
      const filtered = walletName === 'Main Wallet' ? data : data.filter((d) => d.wallet === walletName);
      setTransactions(filtered);
    } catch (err) {
      console.error('Error fetching wallet transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((a,c)=>a+c.amount,0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((a,c)=>a+c.amount,0);
  const balance = totalIncome - totalExpense;

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div className="welcome-msg">{walletName}</div>
            <div className="welcome-sub">Wallet transactions and summary</div>
          </div>
          <div>
            <button className="btn-primary btn-small" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>

        <div className="cards-container">
          <div className="glass-panel stat-card">
            <div className="title">Balance</div>
            <div className="amount">{balance.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</div>
            <div className="card-trend">{transactions.length} transactions</div>
          </div>
          <div className="glass-panel stat-card">
            <div className="title">Income</div>
            <div className="amount income">{totalIncome.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</div>
          </div>
          <div className="glass-panel stat-card">
            <div className="title">Expense</div>
            <div className="amount expense">{totalExpense.toLocaleString('en-BD', { style: 'currency', currency: 'BDT' })}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ marginTop: 20 }}>
          <h3 className="section-title">Transactions</h3>
          {loading ? <p>Loading...</p> : (
            transactions.length === 0 ? (
              <div className="empty-state"><p>No transactions for this wallet yet.</p></div>
            ) : (
              <>
                <ExpenseChart data={transactions} />
                <div className="transaction-list-wrap" style={{ marginTop: 18 }}>
                  {transactions.map(t => (
                    <div className="transaction-item" key={t.id}>
                      <div className={`t-icon ${t.type === 'Income' ? 'income-icon' : 'expense-icon'}`}>{t.type === 'Income' ? '💰' : '💸'}</div>
                      <div className="t-info">
                        <div className="t-title">{t.title}</div>
                        <span className="t-cat">{t.category} · {t.wallet}</span>
                      </div>
                      <div className="t-right">
                        <div className={`t-amt ${t.type === 'Income' ? 'income' : 'expense'}`}>{t.type === 'Income' ? '+' : '-'}{t.amount}</div>
                        <div className="t-date">{t.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </div>
      </div>
    </>
  );
}

export default WalletView;
