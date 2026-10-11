import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Transaction } from '../types';
import { Plus, Search, Filter, Trash2, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  // New transaction modal
  const [showModal, setShowModal] = useState(false);
  const [newTx, setNewTx] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    payment_method: 'UPI',
    is_essential: false
  });

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.getTransactions({
        search: search || undefined,
        category: filterCategory || undefined,
        type: filterType || undefined
      });
      setTransactions(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [search, filterCategory, filterType]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description || !newTx.amount) return;
    try {
      await api.createTransaction({
        ...newTx,
        amount: Number(newTx.amount)
      });
      setShowModal(false);
      setNewTx({
        description: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        payment_method: 'UPI',
        is_essential: false
      });
      loadTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to add transaction');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.deleteTransaction(id);
      loadTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Transactions Ledger</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Auditable history of all completed expenses and received income.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)',
            color: '#090d16',
            fontWeight: 700,
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '13px'
            }}
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '10px 14px',
            background: '#111622',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            color: '#cbd5e1',
            fontSize: '13px'
          }}
        >
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Education">Education</option>
          <option value="Bills">Bills</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Shopping">Shopping</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '10px 14px',
            background: '#111622',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            color: '#cbd5e1',
            fontSize: '13px'
          }}
        >
          <option value="">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No transactions found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: tx.type === 'income' ? 'rgba(163, 230, 53, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {tx.type === 'income' ? <ArrowDownRight size={20} color="#a3e635" /> : <ArrowUpRight size={20} color="#fb7185" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>{tx.description}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {tx.category} · {tx.transaction_date} · via {tx.payment_method}
                      {tx.is_essential && (
                        <span style={{ marginLeft: '8px', color: '#38bdf8', fontSize: '11px', fontWeight: 600 }}>[Essential]</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: tx.type === 'income' ? '#a3e635' : '#f8fafc'
                  }}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title="Delete transaction"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for creating new transaction */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', background: '#111622' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
              Add New Transaction
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy Dinner, Bus Pass"
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="500"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Type
                  </label>
                  <select
                    value={newTx.type}
                    onChange={(e) => setNewTx({ ...newTx, type: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#192234', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={newTx.category}
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#192234', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Education">Education</option>
                    <option value="Bills">Bills</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Payment Mode
                  </label>
                  <select
                    value={newTx.payment_method}
                    onChange={(e) => setNewTx({ ...newTx, payment_method: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#192234', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                  >
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="NetBanking">Net Banking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  id="essential"
                  checked={newTx.is_essential}
                  onChange={(e) => setNewTx({ ...newTx, is_essential: e.target.checked })}
                  style={{ accentColor: '#a3e635' }}
                />
                <label htmlFor="essential" style={{ fontSize: '13px', color: '#cbd5e1' }}>
                  Mark as mandatory essential expense
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)',
                    color: '#090d16',
                    fontWeight: 700,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Save Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#cbd5e1',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
