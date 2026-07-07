import React, { useState, useEffect } from 'react';

export default function Shop({ onNavigate }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buying, setBuying] = useState(null);

  const success = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('checkout') === 'success';

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => { setListings(d.listings || []); setLoading(false); })
      .catch(() => { setError('Could not load listings.'); setLoading(false); });
  }, []);

  const handleBuy = async (listing) => {
    setBuying(listing.id);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: listing.priceId, productId: listing.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Checkout failed');
      }
    } catch (err) {
      alert(err.message);
      setBuying(null);
    }
  };

  return (
    <main className="shop">
      <div className="wrap">

        <div className="shop-head">
          <div className="eyebrow">In the Shop</div>
          <h2>Available Now.</h2>
          <p className="shop-sub">
            Each instrument is built, numbered, and set up by hand in Fortville, Indiana.
            When it's gone, it's gone. Affirm, Afterpay, Klarna, and all major cards accepted at checkout.
          </p>
        </div>

        {success && (
          <div className="shop-success">
            Order placed — check your email for confirmation. Thank you.
          </div>
        )}

        {loading && (
          <div className="shop-state">Loading...</div>
        )}

        {error && (
          <div className="shop-state shop-state-error">{error}</div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="shop-empty">
            <p>Nothing in the shop right now.</p>
            <p>New builds drop in small batches — check back soon.</p>
            <button className="btn btn-ghost" style={{ marginTop: 28 }} onClick={() => onNavigate('dealers')}>
              Find a dealer instead →
            </button>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="shop-grid">
            {listings.map(listing => (
              <ShopCard
                key={listing.id}
                listing={listing}
                onBuy={handleBuy}
                buying={buying === listing.id}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

function ShopCard({ listing, onBuy, buying }) {
  const price = listing.price != null
    ? `$${(listing.price / 100).toLocaleString()}`
    : 'Price on request';

  return (
    <div className="shop-card">
      <div className="shop-card-img">
        {listing.images?.[0]
          ? <img src={listing.images[0]} alt={listing.name} />
          : <div className="shop-card-ph">{listing.model || listing.name}</div>
        }
        {listing.type && (
          <span className="shop-card-type-badge">
            {listing.type === 'guitar' ? 'Guitar' : 'Pickups'}
          </span>
        )}
      </div>

      <div className="shop-card-body">
        {listing.model && (
          <div className="shop-card-model">{listing.model.toUpperCase()}</div>
        )}
        <h3 className="shop-card-name">{listing.name}</h3>
        {listing.serial && (
          <div className="shop-card-serial">S/N {listing.serial}</div>
        )}
        {listing.description && (
          <p className="shop-card-desc">{listing.description}</p>
        )}
        {listing.condition && (
          <p className="shop-card-condition">{listing.condition}</p>
        )}

        <div className="shop-card-footer">
          <span className="shop-card-price">{price}</span>
          <button
            className="btn btn-amber"
            onClick={() => onBuy(listing)}
            disabled={buying || !listing.priceId}
          >
            {buying ? 'Redirecting...' : 'Buy now →'}
          </button>
        </div>

        <div className="shop-card-payment-note">
          Affirm · Afterpay · Klarna · All major cards
        </div>
      </div>
    </div>
  );
}
