import React, { useState, useEffect } from 'react';

export default function ListingDetail({ id, onNavigate, cart = [], addToCart }) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    fetch(`/api/products?id=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.listing) { setListing(d.listing); setLoading(false); }
        else { setError('Listing not found.'); setLoading(false); }
      })
      .catch(() => { setError('Could not load listing.'); setLoading(false); });
  }, [id]);

  const handleBuy = async () => {
    if (!listing?.priceId) return;
    setBuying(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: listing.priceId, productId: listing.id }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else throw new Error(data.error || 'Checkout failed');
    } catch (err) {
      alert(err.message);
      setBuying(false);
    }
  };

  if (loading) return (
    <main className="listing-page">
      <div className="wrap"><div className="listing-state">Loading...</div></div>
    </main>
  );

  if (error || !listing) return (
    <main className="listing-page">
      <div className="wrap">
        <div className="listing-state listing-state-error">{error || 'Not found.'}</div>
        <button className="btn btn-ghost" onClick={() => onNavigate('shop')}>← Back to shop</button>
      </div>
    </main>
  );

  const images = listing.images?.length ? listing.images : [];
  const price = listing.price != null ? `$${(listing.price / 100).toLocaleString()}` : 'Price on request';
  const sold = !listing.available;
  const inCart = cart.some(i => i.id === listing.id);

  const handleAddToCart = () => {
    addToCart?.({
      id: listing.id,
      name: listing.name,
      model: listing.model,
      serial: listing.serial,
      price: listing.price,
      priceId: listing.priceId,
      image: images[0] || null,
    });
  };

  return (
    <main className="listing-page">
      <div className="wrap">

        <button className="listing-back" onClick={() => onNavigate('shop')}>
          ← Back to shop
        </button>

        <div className="listing-grid">

          {/* Gallery */}
          <div className="listing-gallery">
            <div className="listing-main-wrap">
              {images.length > 0
                ? <img className="listing-main-img" src={images[activeImg]} alt={listing.name} />
                : <div className="listing-main-ph">{listing.model || listing.name}</div>
              }
              {sold && <div className="listing-sold-banner">Sold</div>}
            </div>
            {images.length > 1 && (
              <div className="listing-thumbs">
                {images.map((src, i) => (
                  <button
                    key={i}
                    className={`listing-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={src} alt={`Photo ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="listing-info">
            {listing.model && <div className="listing-model">{listing.model.toUpperCase()}</div>}
            <h1 className="listing-name">{listing.name}</h1>
            {listing.serial && <div className="listing-serial">S/N {listing.serial}</div>}

            {listing.description && (
              <p className="listing-desc">{listing.description}</p>
            )}
            {listing.condition && (
              <p className="listing-condition">{listing.condition}</p>
            )}

            <div className="listing-price-row">
              <span className="listing-price">{price}</span>
            </div>

            {!sold ? (
              <>
                {inCart ? (
                  <button
                    className="btn btn-ghost listing-buy-btn"
                    onClick={() => onNavigate('cart')}
                    style={{ marginBottom: 10 }}
                    disabled
                  >
                    In cart ✓
                  </button>
                ) : (
                  <button
                    className="btn btn-amber listing-buy-btn"
                    onClick={handleAddToCart}
                    disabled={!listing.priceId}
                    style={{ marginBottom: 10 }}
                  >
                    Add to cart →
                  </button>
                )}
                <button
                  className="btn btn-ghost listing-buy-btn"
                  onClick={handleBuy}
                  disabled={buying || !listing.priceId}
                >
                  {buying ? 'Redirecting...' : 'Buy now →'}
                </button>
                <div className="listing-payment-note" style={{ marginTop: 14 }}>
                  Affirm · Afterpay · Klarna · All major cards
                </div>
              </>
            ) : (
              <div className="listing-sold-note">This instrument has been sold.</div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
