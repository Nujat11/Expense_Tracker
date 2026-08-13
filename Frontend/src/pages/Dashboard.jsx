import { useState, useEffect, useRef } from 'react';
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
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, onCancel: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([{ wallet: 'Main Wallet' }, { wallet: 'Savings Wallet' }]);
  const [walletFilter, setWalletFilter] = useState('Main Wallet');
  const [newWalletName, setNewWalletName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [draggedWallet, setDraggedWallet] = useState(null);
  const [deleteHovering, setDeleteHovering] = useState(false);
  const [contextMenu, setContextMenu] = useState({ wallet: null, x: 0, y: 0, open: false });
  
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
      fetchWallets(parsedUser.id);

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

  const fetchWallets = async (userId) => {
    try {
      const data = await dataService.getWallets(userId);
      // Ensure canonical order: Main, Savings, then others
      const names = data.map((w) => w.wallet || 'Main Wallet');
      const others = Array.from(new Set(names.filter(n => n !== 'Main Wallet' && n !== 'Savings Wallet'))).sort((a,b)=>a.localeCompare(b));
      const ordered = ['Main Wallet', 'Savings Wallet', ...others];
      setWallets(ordered.map((walletName) => ({ wallet: walletName })));
    } catch (err) {
      console.error('Error fetching wallets', err);
      setWallets([{ wallet: 'Main Wallet' }, { wallet: 'Savings Wallet' }]);
    }
  };

  const handleCreateWallet = async () => {
    if (!newWalletName.trim()) {
      return;
    }
    try {
      await dataService.createWallet(user.id, newWalletName);
      setNewWalletName('');
      fetchWallets(user.id);
      setWalletFilter(newWalletName.trim());
      showToast('Wallet created successfully!', 'success');
    } catch (err) {
      console.error('Error creating wallet', err);
      showToast(err.response?.data?.detail || err.message || 'Unable to create wallet', 'error');
    }
  };

  const handleDeleteWallet = async (walletName) => {
    if (!walletName || walletName === 'Main Wallet') return;
    setConfirmModal({
      show: true,
      title: '🗑️ Delete Wallet',
      message: `Are you sure you want to delete the wallet "${walletName}" and all its transactions? This action is permanent and cannot be undone.`,
      onConfirm: async () => {
        try {
          await dataService.deleteWallet(user.id, walletName);
          if (walletFilter === walletName) {
            setWalletFilter('Main Wallet');
          }
          fetchTransactions(user.id);
          fetchWallets(user.id);
          showToast('Wallet deleted successfully!', 'success');
        } catch (err) {
          console.error('Error deleting wallet', err);
          showToast(err.response?.data?.detail || err.message || 'Unable to delete wallet', 'error');
        }
        setConfirmModal(prev => ({ ...prev, show: false }));
      },
      onCancel: () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const closeContextMenu = () => setContextMenu((prev) => ({ ...prev, open: false }));

  const handleWalletContextMenu = (e, walletName) => {
    e.preventDefault();
    if (walletName === 'Main Wallet') return;
    setContextMenu({ wallet: walletName, x: e.pageX, y: e.pageY, open: true });
  };

  useEffect(() => {
    const closeOnOutside = () => {
      if (contextMenu.open) closeContextMenu();
    };

    window.addEventListener('mousedown', closeOnOutside);
    window.addEventListener('scroll', closeOnOutside);

    return () => {
      window.removeEventListener('mousedown', closeOnOutside);
      window.removeEventListener('scroll', closeOnOutside);
    };
  }, [contextMenu.open]);

  const handleSave = async (expenseData) => {
    try {
      if (expenseToEdit) {
        await dataService.updateExpense(expenseToEdit.id, expenseData);
        showToast('Transaction updated successfully!', 'success');
      } else {
        await dataService.createExpense(expenseData, user.id);
        showToast('Transaction saved successfully!', 'success');
      }
      setIsModalOpen(false);
      setExpenseToEdit(null);
      fetchTransactions(user.id);
      fetchWallets(user.id);
    } catch (err) {
      console.error('Error saving expense', err);
      showToast(err.response?.data?.detail || err.message || 'Unable to save transaction', 'error');
    }
  };

  const handleDelete = (id, title) => {
    setConfirmModal({
      show: true,
      title: '🗑️ Delete Transaction',
      message: `Are you sure you want to delete the transaction "${title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await dataService.deleteExpense(id);
          fetchTransactions(user.id);
          showToast('Transaction deleted successfully!', 'success');
        } catch (err) {
          console.error('Error deleting expense', err);
          showToast(err.response?.data?.detail || err.message || 'Unable to delete transaction', 'error');
        }
        setConfirmModal(prev => ({ ...prev, show: false }));
      },
      onCancel: () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
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
      fetchWallets(user.id);
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
  const visibleWallets = wallets.filter(w => w.wallet !== 'Main Wallet' && w.wallet !== 'Savings Wallet');

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchesType = typeFilter === 'All' || t.type === typeFilter;
      const matchesWallet = walletFilter === 'Main Wallet' ? true : t.wallet === walletFilter;
      return matchesSearch && matchesCategory && matchesType && matchesWallet;
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

  const totalIncome = filteredTransactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;
  const percentSpent = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;

  const fmt = (n) => `৳ ${n.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (!user) return null;

  const today = new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        
        <div className="dashboard-header-row">
          <div>
            <div className="welcome-msg">Hello, <span>{user.name}</span>! 👋</div>
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
            <div className="filter-panel">
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

              <div className="wallet-section" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div className="wallet-list-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block' }}>Wallet View</label>
                        <div style={{ color: '#fff', fontWeight: 700, marginTop: 4 }}>Choose a wallet</div>
                      </div>
                      <button type="button" className="btn-primary btn-small" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => navigate('/wallets')}>View All Wallets</button>
                    </div>

                    {visibleWallets.length === 0 ? (
                      <div className="empty-state" style={{ padding: '18px 14px', textAlign: 'center' }}>
                        No individual wallets available yet.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {visibleWallets.map((w) => (
                          <button
                            key={w.wallet}
                            type="button"
                            className="wallet-list-item"
                            draggable
                            onDragStart={() => { setDraggedWallet(w.wallet); setDeleteHovering(false); }}
                            onDragEnd={() => { setDraggedWallet(null); setDeleteHovering(false); }}
                            onContextMenu={(e) => handleWalletContextMenu(e, w.wallet)}
                            onClick={() => navigate(`/wallet/${encodeURIComponent(w.wallet)}`)}
                          >
                            <span>{w.wallet}</span>
                            <span>›</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`wallet-delete-target ${draggedWallet ? 'visible' : ''} ${deleteHovering ? 'active' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedWallet) setDeleteHovering(true);
                      }}
                      onDragLeave={() => setDeleteHovering(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedWallet) {
                          setDeleteHovering(false);
                          handleDeleteWallet(draggedWallet);
                          setDraggedWallet(null);
                        }
                      }}
                    >
                      {draggedWallet ? `Drop "${draggedWallet}" here to delete` : 'Drag a wallet here to delete'}
                    </div>

                    {contextMenu.open && (
                      <div
                        className="wallet-context-menu"
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="wallet-context-menu-item"
                          onClick={() => {
                            handleDeleteWallet(contextMenu.wallet);
                            closeContextMenu();
                          }}
                        >
                          Delete "{contextMenu.wallet}"
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="wallet-add-row" style={{ maxWidth: '100%' }}>
                    <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '8px' }}>Add Wallet</label>
                    <div className="wallet-add-grid">
                      <input
                        type="text"
                        className="input-glass"
                        style={{ padding: '12px 16px', fontSize: '1rem', width: '100%', marginBottom: 0 }}
                        placeholder="New wallet name"
                        value={newWalletName}
                        onChange={(e) => setNewWalletName(e.target.value)}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-primary btn-small"
                          style={{ whiteSpace: 'nowrap', padding: '12px 28px', width: '100%', maxWidth: '160px' }}
                          onClick={handleCreateWallet}
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
                      <span className="t-cat">{t.category} · {t.wallet || 'Main Wallet'}</span>
                    </div>
                    <div className="t-right">
                      <div className={`t-amt ${t.type === 'Income' ? 'income' : 'expense'}`}>
                        {t.type === 'Income' ? '+' : '-'}{fmt(t.amount)}
                      </div>
                      <div className="t-date">{t.date}</div>
                    </div>
                    <div className="t-actions">
                      <button className="btn-edit" onClick={() => openEditModal(t)}>Edit</button>
                      <button className="btn-del" onClick={() => handleDelete(t.id, t.title)}>Del</button>
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
        wallets={wallets}
      />

      {confirmModal.show && (
        <div className="modal-overlay" onClick={confirmModal.onCancel}>
          <div className="glass-panel modal-content confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="section-title text-danger">{confirmModal.title}</h3>
              <button className="close-btn" onClick={confirmModal.onCancel}>✕</button>
            </div>
            <div style={{ marginBottom: '24px', color: '#cacedb', lineHeight: '1.6', fontSize: '0.95rem', textAlign: 'left' }}>
              {confirmModal.message}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-edit" style={{ padding: '10px 20px', fontSize: '0.9rem', marginBottom: 0 }} onClick={confirmModal.onCancel}>
                Cancel
              </button>
              <button className="btn-danger" style={{ padding: '10px 24px', fontSize: '0.9rem', width: 'auto', marginBottom: 0 }} onClick={confirmModal.onConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span className="toast-icon">{toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ ...toast, show: false })}>✕</button>
        </div>
      )}
    </>
  );
}

export default Dashboard;
