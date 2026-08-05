import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ExpenseModal from '../components/ExpenseModal';
import ExpenseChart from '../components/ExpenseChart';
import { dataService, getStorageMode } from '../dataService';

const CATEGORY_ICONS = {
  Food: '🍔', Transport: '🚌', Rent: '🏠',
  Entertainment: '🎬', Salary: '💼', Other: '📦',
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  
  // Budget values
  const [budgetLimit, setBudgetLimit] = useState(2000);
  const [budgetInput, setBudgetInput] = useState('2000');
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');

  const navigate = useNavigate();
  const storageMode = getStorageMode();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchTransactions(parsedUser.id);

      // Load budget limit
      const storedBudget = localStorage.getItem(`budget_limit_${parsedUser.id}`);
      if (storedBudget) {
        setBudgetLimit(parseFloat(storedBudget));
        setBudgetInput(storedBudget);
      }
    }
  }, [navigate]);

  const fetchTransactions = async (userId) => {
    try {
      const data = await dataService.getExpenses(userId);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions', err);
    }
  };

  const handleSave = async (expenseData) => {
    try {
      if (expenseToEdit) {
        await dataService.updateExpense(expenseToEdit.id, expenseData);
      } else {
        await dataService.createExpense(expenseData, user.id);
      }
      setIsModalOpen(false);
      setExpenseToEdit(null);
      fetchTransactions(user.id);
    } catch (err) {
      console.error('Error saving expense', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dataService.deleteExpense(id);
      fetchTransactions(user.id);
    } catch (err) {
      console.error('Error deleting expense', err);
    }
  };

  const saveBudget = () => {
    const parsedLimit = parseFloat(budgetInput);
    if (!isNaN(parsedLimit) && parsedLimit >= 0) {
      localStorage.setItem(`budget_limit_${user.id}`, parsedLimit.toString());
      setBudgetLimit(parsedLimit);
      setIsEditingBudget(false);
    }
  };

  const handleSeedData = () => {
    if (user) {
      dataService.seedMockData(user.id);
      fetchTransactions(user.id);
    }
  };

  const openAddModal = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setExpenseToEdit(t);
    setIsModalOpen(true);
  };

  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;
  const percentSpent = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;

  // Filter & Sort implementation
  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchesType = typeFilter === 'All' || t.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'date_asc') {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

  const fmt = (n) => `৳ ${n.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (!user) return null;

  const today = new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' }}>
          <div>
            <div className="welcome-msg" style={{ marginBottom: 0 }}>Hello, <span>{user.name}</span>! 👋</div>
            <div className="welcome-sub">{today}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {storageMode === 'local' && (
              <button 
                className="btn-edit" 
                style={{ padding: '8px 16px', background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', border: '1px solid rgba(0, 212, 255, 0.2)' }}
                onClick={handleSeedData}
              >
                ⚡ Load Sample Data
              </button>
            )}
            <button className="btn-primary btn-small" onClick={openAddModal} style={{ width: 'auto', padding: '10px 20px' }}>
              + Add Transaction
            </button>
          </div>
        </div>
        
        <div className="cards-container">
          <div className="glass-panel stat-card">
            <div className="card-icon">💰</div>
            <div className="title">Total Balance</div>
            <div className="amount" style={{ color: balance >= 0 ? 'var(--income-color)' : 'var(--expense-color)' }}>
              {fmt(balance)}
            </div>
            <div className="card-trend">{transactions.length} total transactions</div>
          </div>
          <div className="glass-panel stat-card income-card">
            <div className="card-icon">📈</div>
            <div className="title">Total Income</div>
            <div className="amount income">{fmt(totalIncome)}</div>
            <div className="card-trend">{transactions.filter(t => t.type === 'Income').length} income entries</div>
          </div>
          <div className="glass-panel stat-card expense-card">
            <div className="card-icon">📉</div>
            <div className="title">Total Expense</div>
            <div className="amount expense">{fmt(totalExpense)}</div>
            <div className="card-trend">{transactions.filter(t => t.type === 'Expense').length} expense entries</div>
          </div>
        </div>

        {/* Budget limit progress bar */}
        <div className="glass-panel" style={{ marginBottom: '40px', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 className="section-title" style={{ fontSize: '1.25rem' }}>Monthly Spending Limit</h3>
            <div>
              {isEditingBudget ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    className="input-glass" 
                    style={{ width: '100px', marginBottom: 0, padding: '6px 12px', fontSize: '0.85rem' }} 
                    value={budgetInput} 
                    onChange={(e) => setBudgetInput(e.target.value)} 
                  />
                  <button className="btn-primary btn-small" onClick={saveBudget}>Save</button>
                  <button className="btn-edit" style={{ padding: '6px 12px' }} onClick={() => setIsEditingBudget(false)}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.95rem', color: '#cacedb' }}>Budget Limit: <strong style={{ color: '#00d4ff', fontSize: '1.1rem' }}>${budgetLimit.toFixed(0)}</strong></span>
                  <button className="btn-edit" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setIsEditingBudget(true)}>Edit</button>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ 
            height: '10px', 
            background: 'rgba(0, 0, 0, 0.4)', 
            borderRadius: '50px', 
            overflow: 'hidden',
            marginBottom: '10px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ 
              width: `${Math.min(percentSpent, 100)}%`, 
              height: '100%', 
              background: percentSpent > 85 ? 'var(--expense-color)' : percentSpent > 70 ? '#f1c40f' : 'var(--income-color)',
              transition: 'width 0.4s ease'
            }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cacedb' }}>
            <span>Spent: ${totalExpense.toFixed(2)}</span>
            <span style={{ 
              color: percentSpent > 85 ? 'var(--expense-color)' : percentSpent > 70 ? '#f1c40f' : 'rgba(255,255,255,0.5)',
              fontWeight: percentSpent > 70 ? '600' : 'normal'
            }}>
              {percentSpent.toFixed(1)}% Used {percentSpent > 100 && '(Limit Exceeded!)'}
            </span>
          </div>
        </div>

        <div className="content-section">
          {/* Transactions */}
          <div className="glass-panel transactions-list">
            <div className="section-header">
              <h2 className="section-title">Transactions</h2>
              <button className="btn-primary btn-small" onClick={openAddModal}>+ Add New</button>
            </div>

            {/* Filter and Sorting Controls Pane */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
              gap: '12px', 
              marginBottom: '20px',
              background: 'rgba(0,0,0,0.2)',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.03)'
            }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '6px' }}>Search Title</label>
                <input 
                  type="text" 
                  className="input-glass" 
                  style={{ marginBottom: 0, padding: '8px 12px', fontSize: '0.85rem' }} 
                  placeholder="Search title..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '6px' }}>Filter Type</label>
                <select 
                  className="input-glass" 
                  style={{ marginBottom: 0, padding: '8px 12px', fontSize: '0.85rem' }}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '6px' }}>Filter Category</label>
                <select 
                  className="input-glass" 
                  style={{ marginBottom: 0, padding: '8px 12px', fontSize: '0.85rem' }}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Rent">Rent</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Salary">Salary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '6px' }}>Sort By</label>
                <select 
                  className="input-glass" 
                  style={{ marginBottom: 0, padding: '8px 12px', fontSize: '0.85rem' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date_desc">Date: Newest</option>
                  <option value="date_asc">Date: Oldest</option>
                  <option value="amount_desc">Amount: High-Low</option>
                  <option value="amount_asc">Amount: Low-High</option>
                </select>
              </div>
            </div>
            
            <div className="transaction-list-wrap">
              {filteredTransactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <p>No matching transactions found.<br />Add a transaction or seed mock data to get started!</p>
                </div>
              ) : (
                filteredTransactions.map((t) => (
                  <div className="transaction-item" key={t.id}>
                    <div className={`t-icon ${t.type === 'Income' ? 'income-icon' : 'expense-icon'}`}>
                      {CATEGORY_ICONS[t.category] || '📦'}
                    </div>
                    <div className="t-info">
                      <div className="t-title">{t.title}</div>
                      <span className="t-cat">{t.category}</span>
                    </div>
                    <div className="t-right" style={{ marginRight: '15px' }}>
                      <div className={`t-amt ${t.type === 'Income' ? 'income' : 'expense'}`}>
                        {t.type === 'Income' ? '+' : '-'}{fmt(t.amount)}
                      </div>
                      <div className="t-date">{t.date}</div>
                    </div>
                    <div className="t-actions">
                      <button className="btn-edit" onClick={() => openEditModal(t)}>Edit</button>
                      <button className="btn-del" onClick={() => handleDelete(t.id)}>Del</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="glass-panel chart-section">
            <div className="section-header">
              <h2 className="section-title">Expense Summary</h2>
            </div>
            {filteredTransactions.length === 0 ? (
              <div className="chart-placeholder">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.4 }}>📊</div>
                  <p>Add transactions to see your chart</p>
                </div>
              </div>
            ) : (
              <ExpenseChart data={filteredTransactions} />
            )}
          </div>
        </div>
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        expenseToEdit={expenseToEdit}
      />
    </>
  );
}

export default Dashboard;
