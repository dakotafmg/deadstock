import React, { useState } from 'react';

export default function CartDrawer({ cart, onRemove, onClose, onNavigate }) {
  const [checking, setChecking] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setChecking(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ priceId: i.priceId, productId: i.id })),
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || 'Checkout failed');
    } catch (err) {
      alert(err.message);
      setChecking(false);
    }
  };

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-header">
          <span className="cart-title">Cart {cart.length > 0 && `(${cart.length})`}</span>
          <button className="cart-close" onClick={onClose} aria-label="Close cart">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => { onClose(); onNavigate('shop'); }}>
              Browse the shop →
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  {item.image
                    ? <img className="cart-item-img" src={item.image} alt={item.name} />
                    : <div className="cart-item-img-ph"><span>{item.model || '—'}</span></div>
                  }
                  <div className="cart-item-info">
                    {item.model && <div className="cart-item-model">{item.model.toUpperCase()}</div>}
                    <div className="cart-item-name">{item.name}</div>
                    {item.serial && <div className="cart-item-serial">S/N {item.serial}</div>}
                    <div className="cart-item-price">
                      {item.price != null ? `$${(item.price / 100).toLocaleString()}` : 'Price on request'}
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => onRemove(item.id)} aria-label="Remove">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total-row">
                <span className="cart-total-label">Total</span>
                <span className="cart-total-amount">${(total / 100).toLocaleString()}</span>
              </div>
              <button
                className="btn btn-amber cart-checkout-btn"
                onClick={handleCheckout}
                disabled={checking}
              >
                {checking ? 'Redirecting...' : 'Checkout →'}
              </button>
              <div className="cart-payment-note">
                Affirm · Afterpay · Klarna · All major cards
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
