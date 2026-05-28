/* global React */
const { useEffect, useRef, useState } = React;

// ============================================================
// SHARED COMPONENTS — Nav, Footer, Placeholder, Reveal
// ============================================================

function Nav({ route, onNavigate }) {
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
          <img src="assets/wordmark.svg" alt="Deadstock" />
        </div>

        <nav className="nav-links">
          {/* Guitars dropdown */}
          <div className="nav-dropdown-wrap">
            <span className={"nav-dropdown-trigger" + (isGuitarRoute ? " active" : "")}>
              Guitars
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ marginLeft: 3, flexShrink: 0 }}>
                <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div className="nav-dropdown">
              <a className={route === "broadman" ? "active" : ""} href="#" onClick={(e) => navigate("broadman", e)}>The Broadman</a>
              <a className={route === "wayfarer" ? "active" : ""} href="#" onClick={(e) => navigate("wayfarer", e)}>The Wayfarer</a>
              <a style={{ opacity: 0.4, cursor: "default" }} onClick={(e) => e.preventDefault()}>The Monarch · soon</a>
            </div>
          </div>

          {/* Pickups */}
          <a className={isPickupsRoute ? "active" : ""} href="#" onClick={(e) => navigate("pickups", e)}>Pickups</a>

          {/* Dealers */}
          <a className={route === "dealers" ? "active" : ""} href="#" onClick={(e) => navigate("dealers", e)}>Dealers</a>

          {/* Our Story */}
          <a className={route === "letter" ? "active" : ""} href="#" onClick={(e) => navigate("letter", e)}>Our Story</a>

          {/* Partners */}
          <a className={route === "partners" ? "active" : ""} href="#" onClick={(e) => navigate("partners", e)}>Partners</a>
        </nav>

        <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className="nav-mobile">
        <div className="nav-mobile-label">Guitars</div>
        <div className="nav-mobile-sub-links">
          <a className={route === "broadman" ? "active" : ""} href="#" onClick={(e) => navigate("broadman", e)}>Broadman</a>
          <a className={route === "wayfarer" ? "active" : ""} href="#" onClick={(e) => navigate("wayfarer", e)}>Wayfarer</a>
          <a style={{ opacity: 0.38 }} href="#" onClick={(e) => e.preventDefault()}>Monarch · soon</a>
        </div>
        <a className={isPickupsRoute ? "active" : ""} href="#" onClick={(e) => navigate("pickups", e)}>Pickups</a>
        <a className={route === "dealers" ? "active" : ""} href="#" onClick={(e) => navigate("dealers", e)}>Dealers</a>
        <a className={route === "letter" ? "active" : ""} href="#" onClick={(e) => navigate("letter", e)}>Our Story</a>
        <a className={route === "partners" ? "active" : ""} href="#" onClick={(e) => navigate("partners", e)}>Partners</a>
      </div>
    </header>
  );
}

function Footer({ onNavigate }) {
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
        </div>
        <div>
          <h4>Guitars</h4>
          <ul>
            <li><a style={{ cursor: "pointer" }} onClick={() => onNavigate("broadman")}>The Broadman</a></li>
            <li><a style={{ cursor: "pointer" }} onClick={() => onNavigate("wayfarer")}>The Wayfarer</a></li>
            <li><a style={{ opacity: 0.5 }}>The Monarch · soon</a></li>
          </ul>
        </div>
        <div>
          <h4>Pickups</h4>
          <ul>
            <li><a style={{ cursor: "pointer" }} onClick={() => onNavigate("tele52")}>'52 Tele Set</a></li>
            <li><a style={{ cursor: "pointer" }} onClick={() => onNavigate("strat62")}>'62 Strat Set</a></li>
            <li><a style={{ cursor: "pointer" }} onClick={() => onNavigate("paf")}>PAF Set</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a style={{ cursor: "pointer" }} onClick={() => onNavigate("dealers")}>Dealers</a></li>
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

// Striped placeholder. Pass label, optional corner, optional aspect override.
function PH({ label, corner, style, className = "", children }) {
  return (
    <div className={`ph ${className}`} data-label={label || "image"} style={style}>
      {corner ? <div className="ph-corner">{corner}</div> : null}
      {children}
    </div>
  );
}

// Reveal on scroll (IntersectionObserver-based)
function Reveal({ children, className = "", as = "div", delay = 0, ...rest }) {
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

function DrawLine({ delay = 0 }) {
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

Object.assign(window, { Nav, Footer, PH, Reveal, DrawLine });
