import api, { DEFAULT_API_URL } from './api';

// Helper to get raw storage mode from localStorage. Default to 'local' for standalone database-less mode.
export const getStorageMode = () => {
  return localStorage.getItem('storage_mode') || 'local';
};

export const setStorageMode = (mode) => {
  localStorage.setItem('storage_mode', mode);
};

export const getApiBaseUrl = () => {
  const saved = localStorage.getItem('api_base_url');
  const isLocalHostEnv = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (saved && saved.includes('localhost') && !isLocalHostEnv) {
    localStorage.removeItem('api_base_url');
    return DEFAULT_API_URL;
  }
  return saved || DEFAULT_API_URL;
};

export const setApiBaseUrl = (url) => {
  localStorage.setItem('api_base_url', url);
  api.defaults.baseURL = url;
};

// Apply default baseURL dynamically
api.defaults.baseURL = getApiBaseUrl();

// Mock database tables in localStorage
const getLocalUsers = () => JSON.parse(localStorage.getItem('mock_users') || '{}');
const saveLocalUsers = (users) => localStorage.setItem('mock_users', JSON.stringify(users));

const getLocalExpenses = () => JSON.parse(localStorage.getItem('mock_expenses') || '[]');
const saveLocalExpenses = (expenses) => localStorage.setItem('mock_expenses', JSON.stringify(expenses));

export const dataService = {
  login: async (email, password) => {
    const mode = getStorageMode();
    if (mode === 'local') {
      const users = getLocalUsers();
      const user = users[email];
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password');
      }
      // Return user without password
      const { password: _, ...userOut } = user;
      return userOut;
    } else {
      // Connect to API
      const res = await api.post('/login', { email, password });
      return res.data;
    }
  },

  register: async (name, email, password) => {
    const mode = getStorageMode();
    if (mode === 'local') {
      const users = getLocalUsers();
      if (users[email]) {
        throw new Error('Email already registered');
      }
      const newId = Object.keys(users).length + 1;
      const newUser = { id: newId, name, email, password };
      users[email] = newUser;
      saveLocalUsers(users);
      const { password: _, ...userOut } = newUser;
      return userOut;
    } else {
      const res = await api.post('/register', { name, email, password });
      return res.data;
    }
  },

  getExpenses: async (userId) => {
    const mode = getStorageMode();
    if (mode === 'local') {
      const expenses = getLocalExpenses();
      return expenses.filter(e => e.user_id === userId);
    } else {
      const res = await api.get(`/expenses/${userId}`);
      return res.data;
    }
  },

  createExpense: async (expenseData, userId) => {
    const mode = getStorageMode();
    if (mode === 'local') {
      const expenses = getLocalExpenses();
      const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
      const newExpense = {
        id: newId,
        user_id: userId,
        title: expenseData.title,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        type: expenseData.type,
        date: expenseData.date
      };
      expenses.push(newExpense);
      saveLocalExpenses(expenses);
      return newExpense;
    } else {
      const res = await api.post('/expenses', { ...expenseData, user_id: userId });
      return res.data;
    }
  },

  updateExpense: async (expenseId, expenseData) => {
    const mode = getStorageMode();
    if (mode === 'local') {
      const expenses = getLocalExpenses();
      const index = expenses.findIndex(e => e.id === expenseId);
      if (index === -1) throw new Error('Expense not found');
      
      expenses[index] = {
        ...expenses[index],
        title: expenseData.title,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        type: expenseData.type,
        date: expenseData.date
      };
      saveLocalExpenses(expenses);
      return expenses[index];
    } else {
      const res = await api.put(`/expenses/${expenseId}`, expenseData);
      return res.data;
    }
  },

  deleteExpense: async (expenseId) => {
    const mode = getStorageMode();
    if (mode === 'local') {
      const expenses = getLocalExpenses();
      const filtered = expenses.filter(e => e.id !== expenseId);
      saveLocalExpenses(filtered);
      return { detail: 'Expense deleted' };
    } else {
      const res = await api.delete(`/expenses/${expenseId}`);
      return res.data;
    }
  },

  seedMockData: (userId) => {
    const expenses = getLocalExpenses();
    // Clear old mock data for this user to restart fresh
    const cleanExpenses = expenses.filter(e => e.user_id !== userId);
    
    // Seed new items
    const today = new Date();
    const formatDate = (daysAgo) => {
      const d = new Date();
      d.setDate(today.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const mockItems = [
      { id: 1001, user_id: userId, title: 'Monthly Salary', amount: 5000, category: 'Salary', type: 'Income', date: formatDate(10) },
      { id: 1002, user_id: userId, title: 'Supermarket Groceries', amount: 154.20, category: 'Food', type: 'Expense', date: formatDate(8) },
      { id: 1003, user_id: userId, title: 'Apartment Rent', amount: 1200, category: 'Rent', type: 'Expense', date: formatDate(5) },
      { id: 1004, user_id: userId, title: 'Netflix & Spotify Subs', amount: 24.99, category: 'Entertainment', type: 'Expense', date: formatDate(4) },
      { id: 1005, user_id: userId, title: 'Freelance Design Project', amount: 850, category: 'Salary', type: 'Income', date: formatDate(2) },
      { id: 1006, user_id: userId, title: 'Uber Taxi Rides', amount: 45.50, category: 'Transport', type: 'Expense', date: formatDate(1) },
      { id: 1007, user_id: userId, title: 'Starbucks Coffee', amount: 12.80, category: 'Food', type: 'Expense', date: formatDate(0) },
    ];

    const finalExpenses = [...cleanExpenses, ...mockItems];
    saveLocalExpenses(finalExpenses);
    return mockItems;
  }
};
