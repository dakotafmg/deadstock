import React, { useState, useEffect } from 'react';
import { apiCall } from '../api';

const PAYMENT_METHODS = ['Cash', 'Check', 'Card', 'Bank Transfer', 'Affirm', 'Afterpay', 'Klarna', 'Trade', 'Other'];

// ============================================================
// LOG A SALE
// ============================================================
export function LogSale({ onExpire, onDone }) {
  const [listings, setListings] = useState([]);
  const [items, setItems] = useState([]);
  const [pendingId, setPendingId] = useState('');
  const [pendingName, setPendingName] = useState('');
  const [pendingAmount, setPendingAmount] = useState('');
  const [form, setForm] = useState({ buyerName: '', buyerEmail: '', paymentMethod: 'Cash', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiCall('/api/admin-listings')
      .then(d => setListings((d.listings || []).filter(l => l.available && l.active)))
      .catch(err => { if (err.message === 'SESSION_EXPIRED') onExpire(); });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleListingSelect = (id) => {
    setPendingId(id);
    if (!id) { setPendingName(''); setPendingAmount(''); return; }
    const l = listings.find(l => l.id === id);
    if (l) { setPendingName(l.name); setPendingAmount(l.price ? String(l.price / 100) : ''); }
  };

  const addItem = () => {
    if (!pendingAmount || (!pendingId && !pendingName.trim())) return;
    setItems(prev => [...prev, { productId: pendingId, productName: pendingName, amount: pendingAmount }]);
    setPendingId(''); setPendingName(''); setPendingAmount('');
  };

  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError(null);
    try {
      await apiCall('/api/admin-sales', { method: 'POST', body: { items, ...form } });
      onDone();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      setError(err.message);
      setLoading(false);
    }
  };

  const canAdd = pendingAmount && (pendingId || pendingName.trim());

  return (
    <div>
      <h1 className="admin-page-title">Log a Sale</h1>
      <p className="admin-page-sub">Record a hand sale, dealer transaction, or any sale made outside Stripe Checkout.</p>

      <form className="admin-form" onSubmit={submit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-field">
          <label className="admin-label">Items</label>

          <div className="admin-item-add">
            <select
              className="admin-select"
              value={pendingId}
              onChange={e => handleListingSelect(e.target.value)}
            >
              <option value="">— Manual entry</option>
              {listings.map(l => (
                <option key={l.id} value={l.id}>{l.name}{l.serial ? ` · ${l.serial}` : ''}</option>
              ))}
            </select>
            {!pendingId && (
              <input
                className="admin-input"
                value={pendingName}
                onChange={e => setPendingName(e.target.value)}
                placeholder="Product name"
              />
            )}
            <input
              className="admin-input admin-item-amount-input"
              type="number"
              min="0"
              step="0.01"
              value={pendingAmount}
              onChange={e => setPendingAmount(e.target.value)}
              placeholder="Amount"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (canAdd) addItem(); } }}
            />
            <button type="button" className="admin-btn admin-btn-ghost" onClick={addItem} disabled={!canAdd}>
              + Add
            </button>
          </div>

          {items.length > 0 && (
            <div className="admin-items-list">
              {items.map((item, i) => (
                <div key={i} className="admin-item-row">
                  <span className="admin-item-name">{item.productName || '—'}</span>
                  <span className="admin-item-price">${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                  <button type="button" className="admin-item-remove" onClick={() => removeItem(i)}>✕</button>
                </div>
              ))}
              <div className="admin-items-total">
                <span>Total</span>
                <span>${total.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          )}
        </div>

        <div className="admin-field">
          <label className="admin-label">Payment Method</label>
          <select className="admin-select" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label">Buyer Name <span className="admin-label-opt">(optional)</span></label>
            <input
              className="admin-input"
              value={form.buyerName}
              onChange={e => set('buyerName', e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Buyer Email <span className="admin-label-opt">(optional)</span></label>
            <input
              className="admin-input"
              type="email"
              value={form.buyerEmail}
              onChange={e => set('buyerEmail', e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Notes <span className="admin-label-opt">(optional)</span></label>
          <textarea
            className="admin-textarea"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Show, venue, any details worth noting..."
            rows={2}
          />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading || !items.length}>
            {loading ? 'Saving...' : 'Log sale'}
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onDone}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
