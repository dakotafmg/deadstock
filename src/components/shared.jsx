import React, { useEffect, useRef, useState } from 'react';

// ============================================================
// SHARED COMPONENTS — Nav, Footer, Placeholder, Reveal
// ============================================================

export function Nav({ route, onNavigate, cartCount = 0, onCartOpen }) {
  const [open, setOpen] = useState(false);

  const isGuitarRoute  = ["broadman", "wayfarer"].includes(route);
  const isPickupsRoute = ["pickups", "tele52", "strat62", "paf"].includes(route);

  const navigate = (id, e) => {
    if (e) e.preventDefault();
    setOpen(false);
    onNavigate(id);
  };

  const scrollTo = (selector, e) => {
    if (e) e.preventDefault();
    setOpen(false);
    if (route !== "home") {
      onNavigate("home");
      setTimeout(() => document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } else {
      document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className={"nav" + (open ? " nav-open" : "")}>
      <div className="wrap nav-inner">
        <div className="nav-logo" onClick={() => { setOpen(false); onNavigate("home"); }} aria-label="Deadstock">
          <img src="/assets/wordmark.svg" alt="Deadstock" />
        </div>

        <nav className="nav-links">
          {/* Shop */}
          <a className={route === "shop" ? "active" : ""} href="#" onClick={(e) => navigate("shop", e)}>Shop</a>

          {/* Our Story */}
          <a className={route === "letter" ? "active" : ""} href="#" onClick={(e) => navigate("letter", e)}>Our Story</a>

          {/* Partners */}
          <a className={route === "partners" ? "active" : ""} href="#" onClick={(e) => navigate("partners", e)}>Partners</a>
        </nav>

        <button className="nav-cart-btn" onClick={onCartOpen} aria-label="Open cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
        </button>

        <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className="nav-mobile">
        <a className={route === "shop" ? "active" : ""} href="#" onClick={(e) => navigate("shop", e)}>Shop</a>
        <a className={route === "letter" ? "active" : ""} href="#" onClick={(e) => navigate("letter", e)}>Our Story</a>
        <a className={route === "partners" ? "active" : ""} href="#" onClick={(e) => navigate("partners", e)}>Partners</a>
      </div>
    </header>
  );
}

export function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="brand">
            <img src="assets/wordmark.svg" alt="Deadstock" style={{ width: 280, display: "block", filter: "brightness(0) invert(0.94) sepia(0.20) saturate(0.6)" }} />
          </div>
          <p className="mini" style={{ marginTop: 28 }}>
            Deadstock Guitars are made in small batches at our shop in
            Fortville, Indiana. Every instrument leaves with the maker's
            initials, a build sheet, and the bench it came from.
          </p>
          <div className="footer-social">
            <a href="https://www.instagram.com/deadstockguitars/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
              Instagram
            </a>
            <a href="https://www.facebook.com/DeadstockGuitars" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
              Facebook
            </a>
          </div>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a style={{ cursor: "pointer" }} onClick={() => onNavigate("partners")}>Partners</a></li>
            <li><a style={{ cursor: "pointer" }} onClick={() => onNavigate("letter")}>Our Story</a></li>
            <li><a href="mailto:dealers@deadstockguitars.com">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© Deadstock Guitar Co. · 2026</span>
        <span>Fortville, Indiana</span>
        <span>Built by hand. Built honest.</span>
      </div>
    </footer>
  );
}

// Striped placeholder.
export function PH({ label, corner, style, className = "", children }) {
  return (
    <div className={`ph ${className}`} data-label={label || "image"} style={style}>
      {corner ? <div className="ph-corner">{corner}</div> : null}
      {children}
    </div>
  );
}

// Reveal on scroll (IntersectionObserver-based)
export function Reveal({ children, className = "", as = "div", delay = 0, ...rest }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setVis(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  const Tag = as;
  return (
    <Tag ref={ref} className={`reveal ${vis ? "in" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function DrawLine({ delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setVis(true), delay);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return <div ref={ref} className={`draw-line ${vis ? "in" : ""}`}></div>;
}
