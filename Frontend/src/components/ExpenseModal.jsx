import { useState, useEffect } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Entertainment', 'Salary', 'Other'];

function ExpenseModal({ isOpen, onClose, onSave, expenseToEdit }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('Expense');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmount(expenseToEdit.amount);
      setCategory(expenseToEdit.category);
      setType(expenseToEdit.type);
      setDate(expenseToEdit.date);
    } else {
      setTitle('');
      setAmount('');
      setCategory('Food');
      setType('Expense');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, amount: parseFloat(amount), category, type, date });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-panel modal-content">
        <div className="modal-header">
          <h3 className="section-title">{expenseToEdit ? '✏️ Edit Transaction' : '➕ Add Transaction'}</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="modal-title">Title</label>
            <input
              id="modal-title"
              type="text"
              className="input-glass"
              placeholder="e.g. Grocery shopping"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="flex-row">
            <div className="form-group">
              <label htmlFor="modal-amount">Amount (৳)</label>
              <input
                id="modal-amount"
                type="number"
                step="0.01"
                min="0"
                className="input-glass"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="modal-date">Date</label>
              <input
                id="modal-date"
                type="date"
                className="input-glass"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex-row">
            <div className="form-group">
              <label htmlFor="modal-type">Type</label>
              <select id="modal-type" className="input-glass" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Expense">📉 Expense</option>
                <option value="Income">📈 Income</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="modal-category">Category</label>
              <select id="modal-category" className="input-glass" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
            {expenseToEdit ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ExpenseModal;
